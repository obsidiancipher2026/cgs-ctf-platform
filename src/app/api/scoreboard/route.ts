import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'player', status: 'active' },
      select: {
        id: true,
        username: true,
        score: true,
        country: true,
        college: true,
        createdAt: true,
      },
      orderBy: { score: 'desc' },
    })

    const ranked = users.map((u, i) => ({
      rank: i + 1,
      ...u,
    }))

    return jsonResponse(ranked)
  } catch {
    return jsonResponse({ detail: 'Failed to load scoreboard' }, 500)
  }
}
