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
    const csrfResult = csrfProtection('/api/admin/security/block', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json().catch(() => ({}))
    const { ip_address, user_id, reason } = body

    if (user_id) {
      const target = await prisma.user.findUnique({ where: { id: user_id } })
      if (target) {
        await prisma.user.update({ where: { id: user_id }, data: { isBanned: true } })
      }
    }

    await prisma.log.create({
      data: {
        action: 'security_block',
        userId: user.id,
        ipAddress: ip_address || clientIp,
        severity: 'high',
        details: JSON.stringify({ ip: ip_address, userId: user_id, reason: reason || '' }),
      },
    })

    return jsonResponse({ message: 'Blocked successfully', ip: ip_address, user_id: user_id })
  } catch {
    return jsonResponse({ detail: 'Failed to block' }, 500)
  }
}
