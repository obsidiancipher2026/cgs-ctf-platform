import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const totalChallenges = await prisma.challenge.count({ where: { published: true } })
    const totalUsers = await prisma.user.count({ where: { status: 'active' } })
    const totalSolves = await prisma.submission.count()
    const totalScore = await prisma.user.aggregate({ where: { status: 'active' }, _sum: { score: true } })

    const users = await prisma.user.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        username: true,
        score: true,
        bloodPoints: true,
        country: true,
        college: true,
        createdAt: true,
      },
      orderBy: { score: 'desc' },
    })

    const userIds = users.map(u => u.id)

    const solvesCounts = await prisma.submission.groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { userId: { in: userIds } },
    })
    const solvesMap = new Map(solvesCounts.map(s => [s.userId, s._count.id]))

    const latestSubs = await prisma.submission.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
      select: { userId: true, createdAt: true, challenge: { select: { title: true } } },
      distinct: ['userId'],
    })
    const activityMap = new Map(latestSubs.map(s => [s.userId, { title: s.challenge.title, time: s.createdAt }]))

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      score: u.score,
      bloodPoints: u.bloodPoints,
      country: u.country,
      college: u.college,
      solves: solvesMap.get(u.id) ?? 0,
      totalChallenges,
      lastActivity: activityMap.get(u.id) ?? null,
      createdAt: u.createdAt,
    }))

    return jsonResponse({
      players: ranked,
      stats: {
        totalUsers,
        totalChallenges,
        totalSolves,
        totalScore: totalScore._sum.score ?? 0,
      },
    })
  } catch {
    return jsonResponse({ detail: 'Failed to load scoreboard' }, 500)
  }
}
