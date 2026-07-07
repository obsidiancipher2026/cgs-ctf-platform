import Docker from 'dockerode'
import crypto from 'crypto'
import { OrchestratorProvider, LaunchRequest } from '../types'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' })
const CTF_NETWORK = process.env.CTF_NETWORK || 'ctf_instances'

function sanitizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50)
}

function generateInstanceName(request: LaunchRequest): string {
  const hash = crypto.createHash('sha256').update(request.token).digest('hex').slice(0, 8)
  return `ctf-${sanitizeName(request.challengeSlug)}-${hash}`
}

async function ensureNetwork(): Promise<void> {
  try {
    const networks = await docker.listNetworks({ filters: { name: [CTF_NETWORK] } })
    if (networks.length === 0) {
      await docker.createNetwork({
        Name: CTF_NETWORK,
        Driver: 'bridge',
        Internal: false,
        Labels: { 'cgs.ctf': 'true' },
        IPAM: { Driver: 'default', Config: [{ Subnet: '172.20.0.0/16' }] },
      })
      console.log(`[NETWORK] Created network ${CTF_NETWORK}`)
    }
  } catch (err: any) {
    console.error(`[NETWORK] Failed to ensure network: ${err.message}`)
  }
}

async function pullImage(image: string): Promise<void> {
  return new Promise((resolve, reject) => {
    docker.pull(image, {}, (err: any, stream: any) => {
      if (err) { reject(err); return }
      docker.modem.followProgress(stream, (progressErr: any) => {
        if (progressErr) reject(progressErr)
        else resolve()
      })
    })
  })
}

function parseMemoryLimit(limit: string): number {
  const match = limit.match(/^(\d+)(m|g|mb|gb)?$/i)
  if (!match) return 128 * 1024 * 1024
  const val = parseInt(match[1])
  const unit = (match[2] || 'm').toLowerCase()
  if (unit === 'g' || unit === 'gb') return val * 1024 * 1024 * 1024
  return val * 1024 * 1024
}

function parseCpuLimit(limit: string): { cpuPeriod: number; cpuQuota: number } {
  const num = parseFloat(limit)
  if (isNaN(num) || num <= 0) return { cpuPeriod: 100000, cpuQuota: 50000 }
  return { cpuPeriod: 100000, cpuQuota: Math.round(100000 * num) }
}

async function waitForHealthCheck(
  container: Docker.Container,
  config: LaunchRequest['containerConfig'],
  timeoutMs: number = 60000
): Promise<boolean> {
  const checkType = config.healthCheckType || 'http'
  const checkPath = config.healthCheckPath || '/health'
  const intervalMs = (config.healthCheckInterval || 10) * 1000
  const startTime = Date.now()

  const containerInfo = await container.inspect()
  const ipAddress = containerInfo.NetworkSettings?.Networks?.[CTF_NETWORK]?.IPAddress

  while (Date.now() - startTime < timeoutMs) {
    try {
      if (checkType === 'tcp') {
        const hostIp = containerInfo.NetworkSettings?.IPAddress || '127.0.0.1'
        const hostPort = config.internalPort || 80
        const net = require('net')
        await new Promise<void>((resolve, reject) => {
          const socket = net.createConnection(hostPort, ipAddress || hostIp, () => {
            socket.destroy()
            resolve()
          })
          socket.on('error', reject)
          socket.setTimeout(3000, () => { socket.destroy(); reject(new Error('timeout')) })
        })
      } else {
        const protocol = checkType === 'https' ? 'https' : 'http'
        const url = ipAddress
          ? `${protocol}://${ipAddress}:${config.internalPort || 80}${checkPath}`
          : `${protocol}://localhost:${config.internalPort || 80}${checkPath}`

        const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (response.ok) return true
      }
    } catch {}

    await new Promise(resolve => setTimeout(resolve, Math.min(intervalMs, 5000)))
  }

  return false
}

export const DockerProvider: OrchestratorProvider = {
  name: 'docker',

  async createInstance(request: LaunchRequest): Promise<{ containerId: string; url: string }> {
    await ensureNetwork()
    const { image, internalPort, cpuLimit, memoryLimit, envVariables } = request.containerConfig
    const instanceName = generateInstanceName(request)

    const imageExists = await docker.listImages({ filters: { reference: [image] } })
    if (imageExists.length === 0) {
      console.log(`[DOCKER] Pulling image ${image}...`)
      await pullImage(image)
    }

    const env = [
      `FLAG=${request.flag}`,
      `CHALLENGE_ID=${request.challengeId}`,
      `USER_ID=${request.userId}`,
      `INSTANCE_TOKEN=${request.token}`,
      ...Object.entries(envVariables || {}).map(([k, v]) => `${k}=${v}`),
    ]

    const { cpuPeriod, cpuQuota } = parseCpuLimit(cpuLimit)
    const memBytes = parseMemoryLimit(memoryLimit)

    const container = await docker.createContainer({
      name: instanceName,
      Image: image,
      Env: env,
      ExposedPorts: { [`${internalPort}/tcp`]: {} },
      HostConfig: {
        PortBindings: { [`${internalPort}/tcp`]: [{ HostPort: '0' }] },
        NetworkMode: CTF_NETWORK,
        AutoRemove: true,
        Memory: memBytes,
        MemorySwap: memBytes,
        CpuPeriod: cpuPeriod,
        CpuQuota: cpuQuota,
        PidsLimit: 100,
        ReadonlyRootfs: false,
        SecurityOpt: ['no-new-privileges:true', 'seccomp=unconfined'],
        CapDrop: ['ALL'],
        CapAdd: ['NET_BIND_SERVICE'],
      },
      Labels: {
        'cgs.ctf': 'true',
        'cgs.user': String(request.userId),
        'cgs.challenge': request.challengeSlug,
        'cgs.token': request.token,
        'cgs.instance': request.id,
        'traefik.enable': 'true',
        `traefik.http.routers.ctf-${request.token}.rule`: `Host(\`${request.token}.${process.env.BASE_DOMAIN || 'challenges.ctf.local'}\`)`,
        `traefik.http.routers.ctf-${request.token}.tls`: 'true',
        `traefik.http.services.ctf-${request.token}.loadbalancer.server.port`: String(internalPort),
        `traefik.http.routers.ctf-${request.token}.middlewares`: 'ctf-rate-limit',
      },
    })

    await container.start()
    const info = await container.inspect()
    const containerId = info.Id
    const hostPort = info.NetworkSettings?.Ports?.[`${internalPort}/tcp`]?.[0]?.HostPort || ''
    const ipAddress = info.NetworkSettings?.Networks?.[CTF_NETWORK]?.IPAddress || ''
    const baseDomain = process.env.BASE_DOMAIN || 'localhost'
    const url = baseDomain === 'localhost'
      ? `http://localhost:${hostPort}`
      : `https://${request.token}.${baseDomain}`

    console.log(`[DOCKER] Container ${containerId.slice(0, 12)} started for user ${request.userId} on ${url}`)

    const healthy = await waitForHealthCheck(container, request.containerConfig)
    if (!healthy) {
      console.warn(`[DOCKER] Health check failed for ${containerId.slice(0, 12)}, stopping...`)
      await container.stop({ t: 5 }).catch(() => {})
      throw new Error('Health check failed')
    }

    return { containerId, url }
  },

  async destroyInstance(containerId: string): Promise<void> {
    try {
      const container = docker.getContainer(containerId)
      await container.stop({ t: 5 }).catch((err: any) => {
        if (err.statusCode !== 304 && err.statusCode !== 404) throw err
      })
      await container.remove({ force: true }).catch(() => {})
      console.log(`[DOCKER] Container ${containerId.slice(0, 12)} destroyed`)
    } catch (err: any) {
      console.error(`[DOCKER] Failed to destroy container: ${err.message}`)
    }
  },

  async restartInstance(request: LaunchRequest): Promise<{ containerId: string; url: string }> {
    return this.createInstance(request)
  },

  async getInstanceStatus(containerId: string): Promise<{ running: boolean; healthy: boolean }> {
    try {
      const container = docker.getContainer(containerId)
      const info = await container.inspect()
      const running = info.State.Running
      const healthy = info.State.Health?.Status === 'healthy'
      return { running, healthy: healthy || running }
    } catch {
      return { running: false, healthy: false }
    }
  },

  async getInstanceLogs(containerId: string, tail: number = 100): Promise<string[]> {
    try {
      const container = docker.getContainer(containerId)
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail,
        timestamps: true,
      })
      return logs.toString('utf-8').split('\n').filter(Boolean)
    } catch {
      return []
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const info = await docker.info()
      return !!info.ID
    } catch {
      return false
    }
  },
}
