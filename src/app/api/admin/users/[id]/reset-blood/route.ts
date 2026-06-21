import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { getScore, recalculateRankings } from '@/lib/scoring'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/users/${params.id}/reset-blood`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const userId = parseInt(params.id, 10)
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return jsonResponse({ detail: 'User not found' }, 404)

  await prisma.challenge.updateMany({ where: { firstBloodUserId: userId }, data: { bloodPoints: 0, firstBloodUserId: null } })

  const newScore = await getScore(userId)
  await prisma.user.update({ where: { id: userId }, data: { score: newScore } })
  await recalculateRankings()

  await prisma.log.create({ data: { action: 'user_blood_reset', userId, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ resetBy: user.id }) } })
  return jsonResponse({ message: 'Blood points reset', user_id: userId })
}
