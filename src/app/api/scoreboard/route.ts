import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'
import { getCached, setCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const CACHE_TTL = 8000

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  const cacheKey = `scoreboard:${limit}:${offset}`
  const cached = getCached<ReturnType<typeof jsonResponse>>(cacheKey)
  if (cached) return cached

  const users = await prisma.user.findMany({
    where: { isBanned: false, status: 'active' },
    orderBy: [
      { score: 'desc' },
      { updatedAt: 'asc' },
    ],
    skip: offset,
    take: limit,
    select: {
      id: true,
      username: true,
      score: true,
      ranking: true,
      avatarUrl: true,
      teamId: true,
      createdAt: true,
      country: true,
      college: true,
    },
  })

  const userIds = users.map(u => u.id)

  const [solvedCounts, bloodResult, lastTimes, teams] = await Promise.all([
    prisma.submission.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, isCorrect: true },
      _count: { id: true },
    }),
    prisma.challenge.groupBy({
      by: ['firstBloodUserId'],
      where: { firstBloodUserId: { in: userIds }, bloodPoints: { gt: 0 } },
      _sum: { bloodPoints: true },
    }),
    prisma.submission.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, isCorrect: true },
      _max: { createdAt: true },
    }),
    prisma.team.findMany({
      where: { id: { in: users.map(u => u.teamId).filter(Boolean) as number[] } },
    }),
  ])

  const solvedMap = new Map(solvedCounts.map(s => [s.userId, s._count.id]))
  const bloodMap = new Map(bloodResult.map(b => [b.firstBloodUserId!, b._sum.bloodPoints || 0]))
  const lastTimeMap = new Map(lastTimes.map(l => [l.userId, l._max.createdAt]))
  const teamMap = new Map(teams.map(t => [t.id, t]))

  const entries = users.map(u => ({
    rank: offset + users.indexOf(u) + 1,
    username: u.username,
    score: u.score,
    avatar_url: u.avatarUrl,
    team_name: u.teamId ? teamMap.get(u.teamId)?.name || null : null,
    solved_count: solvedMap.get(u.id) || 0,
    blood_points: bloodMap.get(u.id) || 0,
    last_submission: lastTimeMap.get(u.id) || null,
    country: u.country,
    college: u.college,
  }))

  const totalCount = await prisma.user.count({
    where: { isBanned: false, status: 'active' },
  })

  const response = jsonResponse({ entries, total_count: totalCount })
  setCache(cacheKey, response, CACHE_TTL)
  return response
}
