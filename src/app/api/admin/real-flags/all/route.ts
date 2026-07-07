import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function DELETE(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/real-flags/all', 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const count = await prisma.realFlag.count()
  await prisma.realFlag.deleteMany()
  await prisma.log.create({ data: { action: 'real_flags_all_deleted', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ count }) } })
  return jsonResponse({ message: `All ${count} secret flags deleted`, deleted_count: count })
}
