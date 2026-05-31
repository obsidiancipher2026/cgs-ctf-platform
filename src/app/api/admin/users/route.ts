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

  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })

  const solveCounts = await prisma.submission.groupBy({
    by: ['userId'],
    where: { isCorrect: true },
    _count: { id: true },
  })
  const solveMap = new Map(solveCounts.map(s => [s.userId, s._count.id]))

  const result = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
    role: u.role,
    status: u.status,
    score: u.score,
    ranking: u.ranking,
    solves: solveMap.get(u.id) || 0,
    isBanned: u.isBanned,
    teamId: u.teamId,
    lastIp: u.lastIp,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }))

  return jsonResponse(result)
}
