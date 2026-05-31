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
  const csrfResult = csrfProtection('/api/admin/reset-blood', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  await prisma.challenge.updateMany({ data: { bloodPoints: 0, firstBloodUserId: null } })
  await prisma.log.create({ data: { action: 'all_blood_reset', userId: user.id, ipAddress: clientIp, severity: 'suspicious' } })
  return jsonResponse({ message: 'All blood points have been reset' })
}
