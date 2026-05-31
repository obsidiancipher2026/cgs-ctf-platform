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
  const csrfResult = csrfProtection('/api/admin/security/unblock', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const { ip_address, user_id } = body

  if (user_id) {
    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (target) {
      await prisma.user.update({ where: { id: user_id }, data: { isBanned: false } })
    }
  }

  await prisma.log.create({
    data: {
      action: 'security_unblock',
      userId: user.id,
      ipAddress: ip_address || clientIp,
      severity: 'info',
      details: JSON.stringify({ ip: ip_address, userId: user_id }),
    },
  })

  return jsonResponse({ message: 'Unblocked successfully', ip: ip_address, user_id: user_id })
}
