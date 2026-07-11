import prisma from './prisma'

export const MAINTENANCE_MODE_KEY = 'maintenance_mode'
export const MAINTENANCE_MESSAGE_KEY = 'maintenance_message'
export const DEFAULT_MAINTENANCE_MESSAGE =
  'The site is currently under maintenance. Please check back later.'

export interface MaintenanceStatus {
  enabled: boolean
  message: string
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const [enabled, message] = await Promise.all([
      prisma.securityConfig.findUnique({ where: { key: MAINTENANCE_MODE_KEY } }),
      prisma.securityConfig.findUnique({ where: { key: MAINTENANCE_MESSAGE_KEY } }),
    ])
    return {
      enabled: enabled?.value === 'true',
      message: message?.value || DEFAULT_MAINTENANCE_MESSAGE,
    }
  } catch {
    return { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE }
  }
}

export async function setMaintenanceEnabled(enabled: boolean): Promise<void> {
  await prisma.securityConfig.upsert({
    where: { key: MAINTENANCE_MODE_KEY },
    update: { value: String(enabled) },
    create: { key: MAINTENANCE_MODE_KEY, value: String(enabled) },
  })
}

export async function setMaintenanceMessage(message: string): Promise<void> {
  await prisma.securityConfig.upsert({
    where: { key: MAINTENANCE_MESSAGE_KEY },
    update: { value: message },
    create: { key: MAINTENANCE_MESSAGE_KEY, value: message },
  })
}
