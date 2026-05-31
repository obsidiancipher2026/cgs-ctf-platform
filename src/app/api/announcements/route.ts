import prisma from '@/lib/prisma'
import { jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return jsonResponse(announcements.map(a => ({
    id: a.id,
    title: a.title,
    message: a.message,
    is_broadcast: a.isBroadcast,
    created_at: a.createdAt,
    expires_at: a.expiresAt,
  })))
}
