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

  if (user.role !== 'admin') {
    return jsonResponse({ detail: 'Only admins can publish challenges' }, 403)
  }

  // toggle between published and draft
  const newStatus = challenge.status === 'published' ? 'draft' : 'published'
  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: newStatus },
  })

  await prisma.log.create({
    data: {
      action: 'challenge_toggled',
      userId: user.id,
      ipAddress: clientIp,
      severity: newStatus === 'published' ? 'suspicious' : 'info',
      details: JSON.stringify({ id: challengeId, from: challenge.status, to: newStatus }),
    },
  })

  return jsonResponse({ message: 'Challenge updated', id: challengeId, status: updated.status })
}
