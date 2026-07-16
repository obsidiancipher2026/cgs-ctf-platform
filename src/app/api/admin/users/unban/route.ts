import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
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
    if (!user_id || typeof user_id !== 'number') return jsonResponse({ detail: 'Valid user_id required' }, 400)

    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (!target) return jsonResponse({ detail: 'User not found' }, 404)

    await prisma.user.update({ where: { id: user_id }, data: { isBanned: false } })
    await prisma.log.create({ data: { action: 'user_unbanned', userId: user_id, ipAddress: clientIp, severity: 'info' } })
    return jsonResponse({ message: 'User unbanned', user_id })
  } catch {
    return jsonResponse({ detail: 'Failed to unban user' }, 500)
  }
}
