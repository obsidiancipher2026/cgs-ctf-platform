import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  const users = await prisma.user.findMany({
    where: { isBanned: false, status: 'active', teamId: { not: null } },
    orderBy: { score: 'desc' },
    select: { id: true, score: true, teamId: true },
  })

  const teamScoreMap = new Map<number, { totalScore: number; members: Set<number>; teamName: string; avatarUrl: string | null }>()

  for (const user of users) {
    if (!user.teamId) continue
    if (!teamScoreMap.has(user.teamId)) {
      const team = await prisma.team.findUnique({ where: { id: user.teamId } })
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

  return jsonResponse({ entries, total_count: totalCount })
}
