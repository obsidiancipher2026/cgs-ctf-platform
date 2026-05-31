import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const id = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findFirst({
    where: { id, isPublished: true },
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

  if (!challenge) {
    return jsonResponse({ detail: 'Challenge not found' }, 404)
  }

  const solvedSub = await prisma.submission.findFirst({
    where: { userId: user.id, challengeId: id, isCorrect: true },
  })

  return jsonResponse({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    category: challenge.category,
    difficulty: challenge.difficulty,
    points: challenge.points,
    flag_mode: challenge.flagMode,
    hint: challenge.hint,
    max_attempts: challenge.maxAttempts,
    solver_count: challenge.solverCount,
    file_url: challenge.fileUrl,
    blood_points: challenge.bloodPoints || 0,
    challenge_type: challenge.challengeType,
    is_solved: solvedSub !== null,
    has_blood: (challenge.bloodPoints || 0) > 0,
    created_at: challenge.createdAt,
  })
}
