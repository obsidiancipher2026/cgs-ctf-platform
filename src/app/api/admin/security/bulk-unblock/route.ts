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
  const csrfResult = csrfProtection('/api/admin/security/bulk-unblock', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const ips = body.ips || body
  if (!Array.isArray(ips)) return jsonResponse({ detail: 'ips must be an array' }, 400)

  await prisma.log.create({
    data: {
      action: 'security_bulk_unblock',
      userId: user.id,
      severity: 'info',
      details: JSON.stringify({ ips, count: ips.length }),
    },
  })

  return jsonResponse({ message: `Unblocked ${ips.length} IPs`, count: ips.length })
}
