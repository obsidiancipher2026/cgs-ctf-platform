import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const INSTANCE_SERVER_URL = process.env.INSTANCE_SERVER_URL || 'http://localhost:3100'

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const { slug } = params

    const challenge = await prisma.challenge.findUnique({
      where: { slug, published: true },
      select: {
        id: true, slug: true, title: true, instanceUrl: true, instanceType: true,
        dockerImage: true, instanceTTL: true,
      },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    const existing = await prisma.instance.findFirst({
      where: { userId: user.id, challengeId: challenge.id, status: 'running' },
    })

    if (existing && existing.expiresAt > new Date()) {
      return jsonResponse({
        instance: {
          id: existing.id,
          status: 'running',
          url: existing.url,
          expiresAt: existing.expiresAt,
        },
      })
    }

    if (existing && existing.expiresAt <= new Date()) {
      await prisma.instance.update({
        where: { id: existing.id },
        data: { status: 'expired' },
      })
    }

    const ttl = challenge.instanceTTL || 1800
    let instanceUrl: string | null = null
    let instanceStatus = 'running'

    try {
      const res = await fetch(`${INSTANCE_SERVER_URL}/api/instances/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challenge.id,
          challengeSlug: challenge.slug,
          dockerImage: challenge.dockerImage,
          instanceUrl: challenge.instanceUrl,
          ttl,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.instance) {
          instanceUrl = data.instance.url
          instanceStatus = data.instance.status || 'running'
        }
      }
    } catch (err: any) {
      console.error('[LAUNCH] Instance server unavailable:', err.message)
    }

    if (!instanceUrl && challenge.dockerImage) {
      return jsonResponse({ detail: 'Instance server is unavailable. Please try again later.' }, 503)
    }

    if (!instanceUrl && challenge.instanceUrl) {
      instanceUrl = challenge.instanceUrl
    }

    if (!instanceUrl) {
      return jsonResponse({ detail: 'This challenge does not have a launchable instance' }, 400)
    }

    const instance = await prisma.instance.create({
      data: {
        userId: user.id,
        challengeId: challenge.id,
        status: instanceStatus,
        url: instanceUrl,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    })

    return jsonResponse({
      instance: {
        id: instance.id,
        status: instance.status,
        url: instance.url,
        expiresAt: instance.expiresAt,
        ttl,
      },
    })
  } catch (err: any) {
    console.error('[LAUNCH ERROR]', err.message)
    return jsonResponse({ detail: 'Failed to launch instance' }, 500)
  }
}
