import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { user, error } = await authenticate(request)
  if (error) return error
  if (!user) return jsonResponse({ detail: 'Not authenticated' }, 401)

  const instances = await prisma.instance.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    include: { challenge: { select: { title: true, slug: true } } },
  })

  return jsonResponse(instances.map(i => ({
    instanceId: i.instanceId,
    challengeId: i.challengeId,
    challengeTitle: i.challenge.title,
    challengeSlug: i.challenge.slug,
    url: i.url,
    status: i.status,
    startedAt: i.startedAt.getTime(),
    expiresAt: i.expiresAt.getTime(),
    ttl: Math.max(0, Math.floor((i.expiresAt.getTime() - Date.now()) / 1000)),
  })))
}
