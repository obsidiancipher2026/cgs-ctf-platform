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

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, challenge: true },
  })

  return jsonResponse(submissions.map(s => ({
    id: s.id,
    user_id: s.userId,
    username: s.user.username,
    challenge_id: s.challengeId,
    challenge_title: s.challenge.title,
    flag_provided: s.flagProvided,
    is_correct: s.isCorrect,
    is_first_blood: s.isCorrect && s.challenge.firstBloodUserId === s.userId,
    ip_address: s.ipAddress,
    created_at: s.createdAt,
    team_id: s.teamId,
  })))
}

export async function DELETE(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/submissions', 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  await prisma.submission.deleteMany()
  await prisma.user.updateMany({ data: { score: 0, ranking: 0 } })
  await prisma.challenge.updateMany({ data: { solverCount: 0, firstBloodUserId: null, status: 'draft' } })
  return jsonResponse({ message: 'All submissions cleared, scores, solver counts, and blood data reset' })
}
