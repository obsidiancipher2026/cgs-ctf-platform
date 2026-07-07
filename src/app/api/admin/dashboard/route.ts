import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const totalUsers = await prisma.user.count()
  const suspiciousLogs = await prisma.log.count({ where: { severity: 'suspicious' } })

  return jsonResponse({ total_users: totalUsers, suspicious_logs: suspiciousLogs })
  } catch (e) {
    return jsonResponse({ detail: 'Failed to load dashboard' }, 500)
  }
}
