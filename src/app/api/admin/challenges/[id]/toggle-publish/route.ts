import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}/toggle-publish`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { isPublished: !challenge.isPublished },
  })

  await prisma.log.create({ data: { action: 'challenge_toggled', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ id: challengeId, published: updated.isPublished }) } })
  return jsonResponse({ message: 'Challenge updated', id: challengeId, is_published: updated.isPublished })
}
