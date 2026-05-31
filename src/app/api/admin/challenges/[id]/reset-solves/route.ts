import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { recalculateRankings } from '@/lib/scoring'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}/reset-solves`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  const correctSubs = await prisma.submission.findMany({ where: { challengeId, isCorrect: true } })
  const userIds = [...new Set(correctSubs.map(s => s.userId))]

  await prisma.submission.deleteMany({ where: { challengeId, isCorrect: true } })
  await prisma.challenge.update({ where: { id: challengeId }, data: { solverCount: 0 } })

  for (const uid of userIds) {
    const remaining = await prisma.submission.findMany({
      where: { userId: uid, isCorrect: true },
      include: { challenge: true },
    })
    const total = remaining.reduce((sum, s) => sum + s.challenge.points, 0)
    await prisma.user.update({ where: { id: uid }, data: { score: total, ranking: 0 } })
  }

  await prisma.log.create({ data: { action: 'challenge_solves_reset', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ challengeId }) } })
  await recalculateRankings()
  return jsonResponse({ message: 'Solves reset', challenge_id: challengeId })
}
