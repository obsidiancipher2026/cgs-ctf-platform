import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const MAINTENANCE_FILE = join(process.cwd(), 'public', 'maintenance.json')

async function writeMaintenanceFile(enabled: boolean, message: string) {
  await writeFile(MAINTENANCE_FILE, JSON.stringify({ enabled, message }), 'utf-8')
}

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const enabled = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_mode' } })
  const message = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_message' } })

  return jsonResponse({
    enabled: enabled?.value === 'true',
    message: message?.value || 'The site is currently under maintenance. Please check back later.',
  })
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const body = await request.json().catch(() => ({}))
  const { enabled, message } = body as { enabled?: boolean; message?: string }

  if (typeof enabled === 'boolean') {
    await prisma.securityConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: { value: String(enabled) },
      create: { key: 'maintenance_mode', value: String(enabled) },
    })
  }

  if (typeof message === 'string') {
    await prisma.securityConfig.upsert({
      where: { key: 'maintenance_message' },
      update: { value: message },
      create: { key: 'maintenance_message', value: message },
    })
  }

  const currentEnabled = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_mode' } })
  const currentMessage = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_message' } })

  const isEnabled = currentEnabled?.value === 'true'
  const msg = currentMessage?.value || 'The site is currently under maintenance. Please check back later.'

  await writeMaintenanceFile(isEnabled, msg)

  return jsonResponse({ enabled: isEnabled, message: msg })
}
