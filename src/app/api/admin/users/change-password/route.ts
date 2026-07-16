import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp, getPasswordHash } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { validatePasswordStrength } from '@/lib/sanitizer'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection('/api/admin/users/change-password', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json().catch(() => ({}))
    const { user_id, new_password } = body

    if (!user_id || typeof user_id !== 'number') return jsonResponse({ detail: 'Valid user_id required' }, 400)
    if (!new_password || typeof new_password !== 'string') return jsonResponse({ detail: 'new_password is required' }, 400)

    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (!target) return jsonResponse({ detail: 'User not found' }, 404)

    const pwError = validatePasswordStrength(new_password)
    if (pwError) return jsonResponse({ detail: pwError }, 400)

    await prisma.user.update({ where: { id: user_id }, data: { hashedPassword: await getPasswordHash(new_password) } })
    await prisma.log.create({ data: { action: 'admin_changed_user_password', userId: user_id, ipAddress: clientIp, severity: 'suspicious', details: JSON.stringify({ changedBy: user.id }) } })
    return jsonResponse({ message: 'Password changed', user_id, username: target.username })
  } catch {
    return jsonResponse({ detail: 'Failed to change password' }, 500)
  }
}
