import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return jsonResponse({ detail: 'Invalid challenge ID' }, 400)

    const challenge = await prisma.challenge.findUnique({
      where: { id, published: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        points: true,
        hint: true,
        files: true,
        difficulty: true,
        instanceUrl: true,
        createdAt: true,
      },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    return jsonResponse(challenge)
  } catch {
    return jsonResponse({ detail: 'Failed to load challenge' }, 500)
  }
}
