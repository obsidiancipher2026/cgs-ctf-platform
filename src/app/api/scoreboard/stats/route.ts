import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'
import { getCached, setCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const CACHE_TTL = 10000

export async function GET() {
  try {
  const cached = getCached<ReturnType<typeof jsonResponse>>('scoreboard:stats')
  if (cached) return cached

  const [totalUsers, totalChallenges, totalSubmissions, totalCorrect] = await Promise.all([
    prisma.user.count({ where: { isBanned: false, status: 'active' } }),
    prisma.challenge.count({ where: { status: 'published' } }),
    prisma.submission.count(),
    prisma.submission.count({ where: { isCorrect: true } }),
  ])

  const response = jsonResponse({
    total_users: totalUsers,
    total_challenges: totalChallenges,
    total_submissions: totalSubmissions,
    total_correct: totalCorrect,
  })

  setCache('scoreboard:stats', response, CACHE_TTL)
  return response
  } catch (e) {
    return jsonResponse({ detail: 'Failed to load stats' }, 500)
  }
}
