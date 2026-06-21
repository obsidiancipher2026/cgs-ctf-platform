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
  const csrfResult = csrfProtection('/api/admin/reset', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  await prisma.user.updateMany({ data: { score: 0, ranking: 0 } })
  await prisma.challenge.updateMany({ data: { solverCount: 0, firstBloodUserId: null } })
  await prisma.submission.deleteMany()
  await prisma.log.create({ data: { action: 'competition_reset', userId: user.id, ipAddress: clientIp, severity: 'suspicious' } })
  return jsonResponse({ message: 'Competition has been reset' })
}
