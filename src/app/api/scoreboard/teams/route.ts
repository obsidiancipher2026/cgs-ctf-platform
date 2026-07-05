import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'
import { getCached, setCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const CACHE_TTL = 8000

export async function GET(request: Request) {
  try {
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10) || 0

  const cacheKey = `scoreboard:teams:${limit}:${offset}`
  const cached = getCached<ReturnType<typeof jsonResponse>>(cacheKey)
  if (cached) return cached

  const users = await prisma.user.findMany({
    where: { isBanned: false, status: 'active', teamId: { not: null } },
    orderBy: { score: 'desc' },
    select: { id: true, score: true, teamId: true },
  })

  const teamIds = [...new Set(users.map(u => u.teamId).filter(Boolean) as number[])]
  const teams = await prisma.team.findMany({
    where: { id: { in: teamIds } },
  })
  const teamMap = new Map(teams.map(t => [t.id, t]))

  const teamScoreMap = new Map<number, { totalScore: number; members: Set<number>; teamName: string; avatarUrl: string | null }>()

  for (const user of users) {
    if (!user.teamId) continue
    if (!teamScoreMap.has(user.teamId)) {
      const team = teamMap.get(user.teamId)
      teamScoreMap.set(user.teamId, {
        totalScore: 0,
        members: new Set(),
        teamName: team?.name || 'Unknown',
        avatarUrl: team?.avatarUrl || null,
      })
    }
    const entry = teamScoreMap.get(user.teamId)!
    entry.totalScore += user.score
    entry.members.add(user.id)
  }

  const sorted = Array.from(teamScoreMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalScore - a.totalScore)

  const totalCount = sorted.length
  const paged = sorted.slice(offset, offset + limit)

  const entries = paged.map((t, idx) => ({
    rank: offset + idx + 1,
    team_name: t.teamName,
    total_score: t.totalScore,
    member_count: t.members.size,
    avatar_url: t.avatarUrl,
  }))

  const response = jsonResponse({ entries, total_count: totalCount })
  setCache(cacheKey, response, CACHE_TTL)
  return response
  } catch (e) {
    return jsonResponse({ detail: 'Failed to load teams' }, 500)
  }
}
