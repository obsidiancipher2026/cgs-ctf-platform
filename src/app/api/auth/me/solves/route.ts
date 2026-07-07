import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const solves = await prisma.submission.findMany({
      where: { userId: user.id, solved: true },
      select: {
        challengeId: true,
        createdAt: true,
        challenge: { select: { title: true, points: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return jsonResponse(solves.map(s => ({
      challenge_id: s.challengeId,
      title: s.challenge.title,
      points: s.challenge.points,
      category: s.challenge.category,
      solved_at: s.createdAt,
    })))
  } catch {
    return jsonResponse({ detail: 'Failed to load solves' }, 500)
  }
}
