import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3100'

export async function GET(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const instance = await prisma.instance.findUnique({ where: { instanceId: params.instanceId } })
  if (!instance) return jsonResponse({ detail: 'Instance not found' }, 404)
  if (user && instance.userId !== user.id) return jsonResponse({ detail: 'Not your instance' }, 403)

  const now = Date.now()
  const expiresAt = instance.expiresAt.getTime()
  const ttl = Math.max(0, Math.floor((expiresAt - now) / 1000))

  if (instance.status === 'running' && now >= expiresAt) {
    await prisma.instance.update({ where: { instanceId: params.instanceId }, data: { status: 'expired' } })
    instance.status = 'expired'
  }

  return jsonResponse({
    instanceId: instance.instanceId,
    challengeId: instance.challengeId,
    status: instance.status,
    url: instance.url,
    expiresAt,
    ttl,
  })
}
