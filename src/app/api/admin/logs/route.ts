import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const url = new URL(request.url)
  const severity = url.searchParams.get('severity')
  const limit = parseInt(url.searchParams.get('limit') || '100', 10)
  const where: any = {}
  if (severity) where.severity = severity

  const logs = await prisma.log.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return jsonResponse(logs.map(l => ({
    id: l.id,
    action: l.action,
    details: l.details ? (() => { try { return JSON.parse(l.details) } catch { return l.details } })() : null,
    ip_address: l.ipAddress,
    user_id: l.userId,
    severity: l.severity,
    created_at: l.createdAt,
  })))
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection('/api/admin/logs', 'DELETE', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const count = await prisma.log.count()
    await prisma.log.deleteMany()

    await prisma.log.create({
      data: {
        action: 'logs_cleared',
        userId: user.id,
        ipAddress: clientIp,
        severity: 'suspicious',
        details: JSON.stringify({ clearedCount: count }),
      },
    })

    return jsonResponse({ message: `All logs cleared (${count} entries removed)` })
  } catch {
    return jsonResponse({ detail: 'Failed to clear logs' }, 500)
  }
}
