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
    const csrfResult = csrfProtection('/api/admin/users/change-username', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json().catch(() => ({}))
    const { user_id, new_username } = body
    if (!user_id || !new_username || new_username.trim().length < 3) return jsonResponse({ detail: 'Username must be at least 3 characters' }, 400)

    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (!target) return jsonResponse({ detail: 'User not found' }, 404)

    const existing = await prisma.user.findUnique({ where: { username: new_username.trim() } })
    if (existing && existing.id !== user_id) return jsonResponse({ detail: 'Username is already taken' }, 409)

    await prisma.user.update({ where: { id: user_id }, data: { username: new_username.trim() } })
    await prisma.log.create({ data: { action: 'admin_changed_user_username', userId: user_id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ changedBy: user.id, oldUsername: target.username, newUsername: new_username.trim() }) } })
    return jsonResponse({ message: 'Username changed', user_id, username: new_username.trim() })
  } catch {
    return jsonResponse({ detail: 'Failed to change username' }, 500)
  }
}
