import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/users/unban', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const { user_id } = body
  if (user_id) {
    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (target) {
      await prisma.user.update({ where: { id: user_id }, data: { isBanned: false } })
      await prisma.log.create({ data: { action: 'user_unbanned', userId: user_id, ipAddress: clientIp, severity: 'info' } })
      return jsonResponse({ message: 'User unbanned', user_id })
    }
  }
  return jsonResponse({ detail: 'User not found' }, 404)
}
