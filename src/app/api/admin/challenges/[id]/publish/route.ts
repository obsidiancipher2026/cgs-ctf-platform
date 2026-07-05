import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['in_review', 'published', 'archived'],
  in_review: ['draft', 'published', 'archived'],
  published: ['draft', 'archived'],
  archived: ['draft'],
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}/publish`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  const body = await request.json().catch(() => ({}))
  const targetStatus = body.status || 'published'

  if (!['draft', 'in_review', 'published', 'archived'].includes(targetStatus)) {
    return jsonResponse({ detail: `Invalid status: ${targetStatus}. Use draft, in_review, published, or archived.` }, 400)
  }

  const allowed = VALID_TRANSITIONS[challenge.status]
  if (!allowed || !allowed.includes(targetStatus)) {
    return jsonResponse({
      detail: `Cannot transition from '${challenge.status}' to '${targetStatus}'. Allowed transitions: ${(allowed || []).join(', ')}`,
    }, 400)
  }

  if (targetStatus === 'published' && user.role !== 'admin') {
    return jsonResponse({ detail: 'Only admins can publish challenges' }, 403)
  }

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: targetStatus },
  })

  await prisma.log.create({
    data: {
      action: 'challenge_status_change',
      userId: user.id,
      ipAddress: clientIp,
      severity: targetStatus === 'published' ? 'suspicious' : 'info',
      details: JSON.stringify({
        id: challengeId,
        title: challenge.title,
        from: challenge.status,
        to: targetStatus,
      }),
    },
  })

  return jsonResponse({
    message: `Challenge status changed to '${targetStatus}'`,
    id: challengeId,
    status: targetStatus,
    previous_status: challenge.status,
  })
}
