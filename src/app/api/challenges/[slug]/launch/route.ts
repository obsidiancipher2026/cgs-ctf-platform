import prisma from '@/lib/prisma'
import crypto from 'crypto'
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
        id: true, slug: true, title: true, instanceType: true,
        dockerImage: true, instanceTTL: true, internalPort: true,
        cpuLimit: true, memoryLimit: true, envVariables: true,
        healthCheckType: true, healthCheckPath: true, healthCheckInterval: true,
        launchable: true,
      },
    })

    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

    const existing = await prisma.challengeInstance.findFirst({
      where: { userId: user.id, challengeId: challenge.id, status: 'running' },
    })

    if (existing) {
      const now = new Date()
      if (existing.expirationTime > now) {
        return jsonResponse({
          instance: {
            id: existing.id,
            status: existing.status,
            url: existing.url,
            expiresAt: existing.expirationTime,
            token: existing.token,
          },
        })
      }
      await prisma.challengeInstance.update({
        where: { id: existing.id },
        data: { status: 'expired' },
      })
    }

    const ttl = challenge.instanceTTL || 1800
    let instanceUrl: string | null = null
    let containerId: string | null = null
    let instanceToken: string | null = null
    let instanceStatus = 'running'

    try {
      const res = await fetch(`${INSTANCE_SERVER_URL}/api/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challenge.id,
          challengeSlug: challenge.slug,
          dockerImage: challenge.dockerImage,
          internalPort: challenge.internalPort || 80,
          cpuLimit: challenge.cpuLimit || '0.5',
          memoryLimit: challenge.memoryLimit || '128m',
          envVariables: challenge.envVariables || {},
          healthCheckType: challenge.healthCheckType,
          healthCheckPath: challenge.healthCheckPath,
          healthCheckInterval: challenge.healthCheckInterval,
          ttl,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        instanceUrl = data.url || null
        instanceToken = data.token || null
        instanceStatus = data.status || 'running'
      } else {
        const errData = await res.json().catch(() => ({}))
        return jsonResponse({ detail: errData.error || 'Instance server error' }, 502)
      }
    } catch (err: any) {
      console.error('[LAUNCH] Instance server unavailable:', err.message)
      return jsonResponse({ detail: 'Instance server is unavailable. Please try again later.' }, 503)
    }

    if (!instanceUrl) {
      return jsonResponse({ detail: 'Failed to allocate instance' }, 500)
    }

    const instance = await prisma.challengeInstance.create({
      data: {
        userId: user.id,
        challengeId: challenge.id,
        status: instanceStatus,
        url: instanceUrl,
        token: instanceToken || crypto.randomBytes(32).toString('hex'),
        flag: `CGS{${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}_${crypto.randomBytes(8).toString('hex')}}`,
        internalPort: challenge.internalPort || 80,
        expirationTime: new Date(Date.now() + ttl * 1000),
        launchTime: new Date(),
        containerId: containerId || undefined,
      },
    })

    return jsonResponse({
      instance: {
        id: instance.id,
        status: instance.status,
        url: instance.url,
        expiresAt: instance.expirationTime,
        token: instance.token,
        ttl,
      },
    })
  } catch (err: any) {
    console.error('[LAUNCH ERROR]', err.message)
    return jsonResponse({ detail: 'Failed to launch instance' }, 500)
  }
}
