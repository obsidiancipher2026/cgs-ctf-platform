import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const where: any = { published: true }
    if (category) where.category = category

    const challenges = await prisma.challenge.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        points: true,
        hint: true,
        files: true,
        difficulty: true,
        instanceUrl: true,
        instanceType: true,
        dockerImage: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    })
    return jsonResponse(challenges)
  } catch {
    return jsonResponse({ detail: 'Failed to load challenges' }, 500)
  }
}
