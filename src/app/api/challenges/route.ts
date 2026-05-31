import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const url = new URL(request.url)
  const categoryFilter = url.searchParams.get('category')

  const challenges = await prisma.challenge.findMany({
    where: {
      isPublished: true,
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    orderBy: [{ category: 'asc' }, { points: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      difficulty: true,
      points: true,
      flagMode: true,
      hint: true,
      maxAttempts: true,
      solverCount: true,
      fileUrl: true,
      bloodPoints: true,
      challengeType: true,
      createdAt: true,
    },
  })

  const solvedSubs = await prisma.submission.findMany({
    where: { userId: user.id, isCorrect: true },
    select: { challengeId: true },
  })
  const solvedIds = new Set(solvedSubs.map(s => s.challengeId))

  const result = challenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    points: c.points,
    flag_mode: c.flagMode,
    hint: c.hint,
    max_attempts: c.maxAttempts,
    solver_count: c.solverCount,
    file_url: c.fileUrl,
    blood_points: c.bloodPoints || 0,
    challenge_type: c.challengeType,
    is_solved: solvedIds.has(c.id),
    has_blood: (c.bloodPoints || 0) > 0,
    created_at: c.createdAt,
  }))

  return jsonResponse(result)
}
