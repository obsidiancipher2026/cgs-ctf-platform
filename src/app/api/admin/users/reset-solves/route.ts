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
    const csrfResult = csrfProtection('/api/admin/users/reset-solves', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json().catch(() => ({}))
    if (!body) return jsonResponse({ detail: 'Request body required' }, 400)

    const { user_id } = body
    if (!user_id || typeof user_id !== 'number') return jsonResponse({ detail: 'Valid user_id required' }, 400)

    const target = await prisma.user.findUnique({ where: { id: user_id } })
    if (!target) return jsonResponse({ detail: 'User not found' }, 404)

    await prisma.submission.deleteMany({ where: { userId: user_id } })
    await prisma.user.update({ where: { id: user_id }, data: { score: 0, bloodPoints: 0 } })

    await prisma.log.create({
      data: {
        action: 'admin_reset_solves',
        userId: user.id,
        ipAddress: clientIp,
        severity: 'warning',
        details: JSON.stringify({ target_user_id: user_id, target_username: target.username }),
      },
    })

    return jsonResponse({ message: 'Solves, score, and blood points reset', user_id })
  } catch (err) {
    console.error('[reset-solves] Error:', err instanceof Error ? err.message : err)
    return jsonResponse({ detail: 'Failed to reset solves' }, 500)
  }
}
