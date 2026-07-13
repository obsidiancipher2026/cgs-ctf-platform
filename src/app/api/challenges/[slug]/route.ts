import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug, published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        markdown: true,
        story: true,
        category: true,
        points: true,
        flag: false,
        hint: true,
        hints: true,
        hintPenalty: true,
        files: true,
        downloads: true,
        difficulty: true,
        author: true,
        tags: true,
        instanceUrl: true,
        instanceType: true,
        estimatedTime: true,
        solveCount: true,
        solveRate: true,
        firstBloodTimestamp: true,
        bloodAwarded: true,
        firstSolverUserId: true,
        createdAt: true,
      },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    let firstSolverUsername: string | null = null
    if (challenge.bloodAwarded && challenge.firstSolverUserId) {
      const solver = await prisma.user.findUnique({
        where: { id: challenge.firstSolverUserId },
        select: { username: true },
      })
      firstSolverUsername = solver?.username ?? null
    }

    return jsonResponse({
      ...challenge,
      firstSolverUsername,
    })
  } catch {
    return jsonResponse({ detail: 'Failed to load challenge' }, 500)
  }
}
