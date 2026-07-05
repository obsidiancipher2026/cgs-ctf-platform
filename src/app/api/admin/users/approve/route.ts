import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/users/approve', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id) return jsonResponse({ detail: 'user_id is required' }, 400)

    const targetUser = await prisma.user.findUnique({ where: { id: user_id } })
    if (!targetUser) return jsonResponse({ detail: 'User not found' }, 404)

    await prisma.user.update({
      where: { id: user_id },
      data: { status: 'active' },
    })

    await prisma.log.create({
      data: {
        action: 'user_approved',
        userId: user.id,
        ipAddress: clientIp,
        severity: 'info',
        details: JSON.stringify({ approvedUserId: user_id, username: targetUser.username }),
      },
    })

    return jsonResponse({ detail: 'User approved successfully' })
  } catch (e) {
    return jsonResponse({ detail: 'Failed to approve user' }, 500)
  }
}
