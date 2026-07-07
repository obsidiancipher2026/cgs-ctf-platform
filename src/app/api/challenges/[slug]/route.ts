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
        instanceStatus: true,
        dockerImage: true,
        estimatedTime: true,
        solveCount: true,
        solveRate: true,
        createdAt: true,
      },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    return jsonResponse(challenge)
  } catch {
    return jsonResponse({ detail: 'Failed to load challenge' }, 500)
  }
}
