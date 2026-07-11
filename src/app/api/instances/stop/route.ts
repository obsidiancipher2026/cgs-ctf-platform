import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3100'

export async function POST(request: NextRequest) {
  const { user, error } = await authenticate(request)
  if (error) return error
  if (!user) return jsonResponse({ detail: 'Not authenticated' }, 401)

  try {
    const { instanceId } = await request.json()
    if (!instanceId) return jsonResponse({ detail: 'instanceId required' }, 400)

    const instance = await prisma.instance.findUnique({ where: { instanceId } })
    if (!instance) return jsonResponse({ detail: 'Instance not found' }, 404)
    if (instance.userId !== user.id) return jsonResponse({ detail: 'Not your instance' }, 403)

    // Tell orchestrator to stop
    try {
      await fetch(`${ORCHESTRATOR_URL}/api/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId, userId: String(user.id) }),
        signal: AbortSignal.timeout(5000),
      })
    } catch {}

    await prisma.instance.update({
      where: { instanceId },
      data: { status: 'stopped' },
    })

    return jsonResponse({ success: true })
  } catch (e: any) {
    return jsonResponse({ detail: e.message || 'Failed to stop instance' }, 500)
  }
}
