import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const totalUsers = await prisma.user.count({ where: { isBanned: false, status: 'active' } })
  const totalChallenges = await prisma.challenge.count({ where: { isPublished: true } })
  const totalSubmissions = await prisma.submission.count()
  const totalCorrect = await prisma.submission.count({ where: { isCorrect: true } })

  return jsonResponse({
    total_users: totalUsers,
    total_challenges: totalChallenges,
    total_submissions: totalSubmissions,
    total_correct: totalCorrect,
  })
}
