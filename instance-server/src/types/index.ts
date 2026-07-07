export type InstanceStatus = 'creating' | 'pulling' | 'starting' | 'running' | 'restarting' | 'stopping' | 'expired' | 'error'

export type InstanceEventType = 'launched' | 'pulling_image' | 'container_created' | 'container_started' | 'health_check_passed' | 'restarted' | 'terminated' | 'expired' | 'extended' | 'error' | 'heartbeat'

export interface ContainerConfig {
  image: string
  internalPort: number
  cpuLimit: string
  memoryLimit: string
  envVariables: Record<string, string>
  healthCheckType?: string
  healthCheckPath?: string
  healthCheckInterval?: number
}

export interface LaunchRequest {
  userId: number
  challengeId: number
  challengeSlug: string
  token: string
  flag: string
  containerConfig: ContainerConfig
  ttl: number
}

export interface InstanceInfo {
  id: string
  userId: number
  challengeId: number
  token: string
  status: InstanceStatus
  url: string
  expiresAt: string
  extendedCount: number
  errorMessage?: string
}

export interface OrchestratorProvider {
  name: string
  createInstance(request: LaunchRequest): Promise<{ containerId: string; url: string }>
  destroyInstance(containerId: string): Promise<void>
  restartInstance(containerId: string, request: LaunchRequest): Promise<{ containerId: string; url: string }>
  getInstanceStatus(containerId: string): Promise<{ running: boolean; healthy: boolean }>
  getInstanceLogs(containerId: string, tail?: number): Promise<string[]>
  healthCheck(): Promise<boolean>
}
