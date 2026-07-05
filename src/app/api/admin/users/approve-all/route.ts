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
  const csrfResult = csrfProtection('/api/admin/users/approve-all', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const result = await prisma.user.updateMany({
      where: { status: 'pending' },
      data: { status: 'active' },
    })

    await prisma.log.create({
      data: {
        action: 'bulk_user_approval',
        userId: user.id,
        ipAddress: clientIp,
        severity: 'info',
        details: JSON.stringify({ approvedCount: result.count }),
      },
    })

    return jsonResponse({ detail: `${result.count} user(s) approved`, count: result.count })
  } catch (e) {
    return jsonResponse({ detail: 'Failed to approve users' }, 500)
  }
}
