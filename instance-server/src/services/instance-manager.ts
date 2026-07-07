import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { DockerProvider } from './docker-provider'
import { InstanceInfo, InstanceStatus, InstanceEventType, OrchestratorProvider, LaunchRequest } from '../types'
import { EventEmitter } from 'events'

type StatusCallback = (instanceId: string, status: string, progress?: string) => void
type LogCallback = (instanceId: string, level: string, message: string) => void
type EventCallback = (instanceId: string, eventType: string, details?: any) => void

export class InstanceManager extends EventEmitter {
  private provider: OrchestratorProvider
  private instances: Map<string, InstanceInfo & { containerId?: string }> = new Map()
  private userInstances: Map<number, Set<string>> = new Map()
  private janitorInterval: NodeJS.Timeout | null = null

  onStatus: StatusCallback = () => {}
  onLog: LogCallback = () => {}
  onEvent: EventCallback = () => {}

  constructor() {
    super()
    this.provider = DockerProvider
    this.startJanitor()
  }

  async init(): Promise<void> {
    const healthy = await this.provider.healthCheck()
    if (!healthy) {
      console.warn('[MANAGER] Docker daemon unreachable. Running in degraded mode.')
    } else {
      console.log('[MANAGER] Docker daemon connected successfully.')
    }
  }

  async launchInstance(request: {
    userId: number
    challengeId: number
    challengeSlug: string
    dockerImage: string
    internalPort: number
    cpuLimit: string
    memoryLimit: string
    envVariables: Record<string, string>
    healthCheckType?: string
    healthCheckPath?: string
    healthCheckInterval?: number
    ttl: number
  }): Promise<InstanceInfo> {
    const instanceId = uuidv4()
    const token = crypto.randomBytes(32).toString('hex')
    const flag = `CGS{${uuidv4().replace(/-/g, '').slice(0, 16)}_${crypto.randomBytes(8).toString('hex')}}`

    this.emitEvent(instanceId, 'launched')
    this.emitLog(instanceId, 'info', 'Launch requested')

    const instance: InstanceInfo & { containerId?: string } = {
      id: instanceId,
      userId: request.userId,
      challengeId: request.challengeId,
      token,
      status: 'creating',
      url: '',
      expiresAt: new Date(Date.now() + request.ttl * 1000).toISOString(),
      extendedCount: 0,
    }

    this.instances.set(instanceId, instance)
    const userSet = this.userInstances.get(request.userId) || new Set()
    userSet.add(instanceId)
    this.userInstances.set(request.userId, userSet)

    this.updateStatus(instanceId, 'creating', 'Initializing environment...')

    try {
      this.updateStatus(instanceId, 'pulling', 'Pulling container image...')
      this.emitEvent(instanceId, 'pulling_image')

      const launchReq: LaunchRequest = {
        id: instanceId,
        userId: request.userId,
        challengeId: request.challengeId,
        challengeSlug: request.challengeSlug,
        token,
        flag,
        ttl: request.ttl,
        containerConfig: {
          image: request.dockerImage,
          internalPort: request.internalPort,
          cpuLimit: request.cpuLimit,
          memoryLimit: request.memoryLimit,
          envVariables: { ...request.envVariables, FLAG: flag },
          healthCheckType: request.healthCheckType,
          healthCheckPath: request.healthCheckPath,
          healthCheckInterval: request.healthCheckInterval,
        },
      }

      this.updateStatus(instanceId, 'starting', 'Starting challenge environment...')
      this.emitEvent(instanceId, 'container_created')

      const result = await this.provider.createInstance(launchReq)
      instance.containerId = result.containerId
      instance.url = result.url
      instance.status = 'running'

      this.updateStatus(instanceId, 'running', 'Challenge ready!')
      this.emitEvent(instanceId, 'health_check_passed')
      this.emitLog(instanceId, 'info', `Instance running at ${result.url}`)
    } catch (err: any) {
      instance.status = 'error'
      instance.errorMessage = err.message
      this.updateStatus(instanceId, 'error', `Failed: ${err.message}`)
      this.emitEvent(instanceId, 'error', { message: err.message })
      this.emitLog(instanceId, 'error', err.message)
      throw err
    }

    return this.getSanitizedInstance(instanceId)
  }

  async destroyInstance(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId)
    if (!instance) return false

    instance.status = 'stopping'

    if (instance.containerId) {
      await this.provider.destroyInstance(instance.containerId).catch(() => {})
    }

    instance.status = 'expired'
    this.emitEvent(instanceId, 'terminated', { reason: 'user_requested' })
    this.emitLog(instanceId, 'info', 'Instance terminated by user')

    const userSet = this.userInstances.get(instance.userId)
    if (userSet) {
      userSet.delete(instanceId)
      if (userSet.size === 0) this.userInstances.delete(instance.userId)
    }

    return true
  }

  async restartInstance(instanceId: string, newTtl: number): Promise<InstanceInfo> {
    const old = this.instances.get(instanceId)
    if (!old) throw new Error('Instance not found')

    await this.destroyInstance(instanceId)

    this.emitEvent(instanceId, 'restarted')

    const request = {
      userId: old.userId,
      challengeId: old.challengeId,
      challengeSlug: old.token,
      dockerImage: old.token,
      internalPort: 80,
      cpuLimit: '0.5',
      memoryLimit: '128m',
      envVariables: {} as Record<string, string>,
      ttl: newTtl,
    }

    return this.launchInstance(request)
  }

  async extendInstance(instanceId: string, additionalSeconds: number, maxTotalMinutes: number): Promise<InstanceInfo> {
    const instance = this.instances.get(instanceId)
    if (!instance) throw new Error('Instance not found')

    const currentExpiry = new Date(instance.expiresAt).getTime()
    const maxExpiry = new Date(instance.launchTime || Date.now()).getTime() + maxTotalMinutes * 60 * 1000
    const newExpiry = Math.min(currentExpiry + additionalSeconds * 1000, maxExpiry)

    instance.expiresAt = new Date(newExpiry).toISOString()
    instance.extendedCount++
    this.emitEvent(instanceId, 'extended', { additionalSeconds, newTotal: instance.extendedCount })
    this.emitLog(instanceId, 'info', `Extended by ${additionalSeconds}s (total: ${instance.extendedCount})`)

    return this.getSanitizedInstance(instanceId)
  }

  getInstance(instanceId: string): InstanceInfo | null {
    const instance = this.instances.get(instanceId)
    if (!instance) return null

    if (new Date(instance.expiresAt) <= new Date() && instance.status === 'running') {
      instance.status = 'expired'
      this.emitEvent(instanceId, 'expired')
    }

    return this.getSanitizedInstance(instanceId)
  }

  getUserInstances(userId: number): InstanceInfo[] {
    const userSet = this.userInstances.get(userId) || new Set()
    return Array.from(userSet)
      .map(id => this.getInstance(id))
      .filter(Boolean) as InstanceInfo[]
  }

  getUserChallengeInstance(userId: number, challengeId: number): InstanceInfo | null {
    const userSet = this.userInstances.get(userId) || new Set()
    for (const id of userSet) {
      const inst = this.instances.get(id)
      if (inst && inst.challengeId === challengeId) {
        return this.getSanitizedInstance(id)
      }
    }
    return null
  }

  getAllInstances(): (InstanceInfo & { containerId?: string })[] {
    return Array.from(this.instances.values()).map(inst => ({
      ...this.getSanitizedInstance(inst.id),
      containerId: inst.containerId,
    }))
  }

  async getInstanceLogs(instanceId: string): Promise<string[]> {
    const instance = this.instances.get(instanceId)
    if (!instance?.containerId) return []
    return this.provider.getInstanceLogs(instance.containerId)
  }

  getInstanceCount(): { total: number; running: number; expired: number; error: number } {
    const total = this.instances.size
    let running = 0, expired = 0, error = 0
    for (const inst of this.instances.values()) {
      if (inst.status === 'running') running++
      else if (inst.status === 'expired') expired++
      else if (inst.status === 'error') error++
    }
    return { total, running, expired, error }
  }

  private startJanitor(): void {
    if (this.janitorInterval) clearInterval(this.janitorInterval)

    this.janitorInterval = setInterval(async () => {
      const now = new Date()
      let cleaned = 0

      for (const [id, instance] of this.instances) {
        const expiresAt = new Date(instance.expiresAt)
        if (expiresAt <= now && instance.status === 'running') {
          console.log(`[JANITOR] Cleaning expired instance ${id.slice(0, 8)} for user ${instance.userId}`)
          try {
            if (instance.containerId) {
              await this.provider.destroyInstance(instance.containerId)
            }
          } catch (err: any) {
            console.error(`[JANITOR] Failed to destroy: ${err.message}`)
          }
          instance.status = 'expired'
          this.emitEvent(id, 'expired', { reason: 'automatic_cleanup' })
          cleaned++
        }
      }

      if (cleaned > 0) console.log(`[JANITOR] Cleaned ${cleaned} expired instances`)
    }, 30_000)

    console.log('[JANITOR] Started (interval: 30s)')
  }

  stop(): void {
    if (this.janitorInterval) {
      clearInterval(this.janitorInterval)
      this.janitorInterval = null
    }
  }

  async shutdown(): Promise<void> {
    console.log('[MANAGER] Shutting down all running instances...')
    this.stop()
    const running = Array.from(this.instances.values()).filter(i => i.status === 'running')
    for (const instance of running) {
      await this.destroyInstance(instance.id).catch(() => {})
    }
    console.log(`[MANAGER] Shutdown complete: ${running.length} instances terminated`)
  }

  private updateStatus(instanceId: string, status: string, progress?: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) instance.status = status as InstanceStatus
    this.onStatus(instanceId, status, progress)
  }

  private emitLog(instanceId: string, level: string, message: string): void {
    this.onLog(instanceId, level, message)
  }

  private emitEvent(instanceId: string, eventType: string, details?: any): void {
    this.onEvent(instanceId, eventType, details)
  }

  private getSanitizedInstance(instanceId: string): InstanceInfo {
    const inst = this.instances.get(instanceId)!
    const { containerId: _, ...sanitized } = inst
    return sanitized
  }
}
