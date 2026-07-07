import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const INSTANCE_SERVER_URL = process.env.INSTANCE_SERVER_URL || 'http://localhost:3100'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    const { user, error } = await authenticate(request)
    if (error) return error

    const instance = await prisma.instance.findFirst({
      where: { userId: user.id, challengeId: challenge.id, status: 'running' },
      orderBy: { createdAt: 'desc' },
    })

    if (!instance) {
      return jsonResponse({ instance: null })
    }

    if (instance.expiresAt <= new Date()) {
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'expired' },
      })
      return jsonResponse({ instance: { ...instance, status: 'expired' } })
    }

    return jsonResponse({
      instance: {
        id: instance.id,
        status: instance.status,
        url: instance.url,
        expiresAt: instance.expiresAt,
      },
    })
  } catch {
    return jsonResponse({ detail: 'Failed to get instance status' }, 500)
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const { slug } = params
    const body = await request.json()
    const { action } = body

    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    const instance = await prisma.instance.findFirst({
      where: { userId: user.id, challengeId: challenge.id, status: 'running' },
      orderBy: { createdAt: 'desc' },
    })

    if (!instance) {
      return jsonResponse({ detail: 'No active instance found' }, 404)
    }

    if (action === 'destroy') {
      try {
        await fetch(`${INSTANCE_SERVER_URL}/api/instances/${instance.id}/destroy`, {
          method: 'POST',
        })
      } catch {}

      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'expired' },
      })

      return jsonResponse({ message: 'Instance destroyed' })
    }

    if (action === 'restart') {
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: 'expired' },
      })

      const launchRes = await fetch(
        `${new URL(request.url).origin}/api/challenges/${slug}/launch`,
        {
          method: 'POST',
          headers: { Cookie: request.headers.get('cookie') || '' },
        }
      )

      if (launchRes.ok) {
        const data = await launchRes.json()
        return jsonResponse(data)
      }

      return jsonResponse({ detail: 'Failed to restart instance' }, 500)
    }

    return jsonResponse({ detail: 'Invalid action' }, 400)
  } catch {
    return jsonResponse({ detail: 'Failed to manage instance' }, 500)
  }
}
