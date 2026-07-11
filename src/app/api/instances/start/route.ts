import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, jsonResponse } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3100'
const INSTANCE_TTL = parseInt(process.env.INSTANCE_TTL || '2700', 10)

function generateFlag(challengeId: number, userId: number): string {
  const secret = process.env.FLAG_SECRET || process.env.JWT_SECRET || 'dev-flag-secret'
  const hmac = crypto.createHmac('sha256', secret).update(`${challengeId}:${userId}`).digest('hex').slice(0, 16)
  return `CGS{${challengeId}_${userId}_${hmac}}`
}

function hashFlag(flag: string): string {
  return crypto.createHash('sha256').update(flag).digest('hex')
}

export async function POST(request: NextRequest) {
  const { user, error } = await authenticate(request)
  if (error) return error
  if (!user) return jsonResponse({ detail: 'Not authenticated' }, 401)

  try {
    const { challengeId } = await request.json()
    if (!challengeId) return jsonResponse({ detail: 'challengeId required' }, 400)

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
    if (!challenge || !challenge.published) return jsonResponse({ detail: 'Challenge not found' }, 404)

    // Check existing running instance
    const existing = await prisma.instance.findFirst({
      where: { userId: user.id, challengeId, status: 'running' },
    })
    if (existing) {
      return NextResponse.json({
        instanceId: existing.instanceId,
        url: existing.url,
        expiresAt: existing.expiresAt.getTime(),
        ttl: Math.max(0, Math.floor((existing.expiresAt.getTime() - Date.now()) / 1000)),
      })
    }

    // Check concurrent instance limit
    const runningCount = await prisma.instance.count({
      where: { userId: user.id, status: 'running' },
    })
    const maxInstances = parseInt(process.env.MAX_INSTANCES_PER_USER || '3', 10)
    if (runningCount >= maxInstances) {
      return jsonResponse({ detail: `Max ${maxInstances} concurrent instances allowed` }, 429)
    }

    const flag = generateFlag(challenge.id, user.id)
    const slug = challenge.slug

    // Call orchestrator
    let instanceData: { instanceId: string; url: string; expiresAt: number }
    try {
      const orchRes = await fetch(`${ORCHESTRATOR_URL}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: slug,
          userId: String(user.id),
          imageName: mapSlugToImage(slug),
        }),
        signal: AbortSignal.timeout(15000),
      })
      instanceData = await orchRes.json()
    } catch {
      // Fallback: return a playground-style mock instance
      instanceData = {
        instanceId: `mock-${slug}-${user.id}`,
        url: `/playground/${slug}`,
        expiresAt: Date.now() + INSTANCE_TTL * 1000,
      }
    }

    const expiresAt = new Date(instanceData.expiresAt)

    await prisma.instance.create({
      data: {
        instanceId: instanceData.instanceId,
        challengeId: challenge.id,
        userId: user.id,
        flagHash: hashFlag(flag),
        url: instanceData.url,
        status: 'running',
        expiresAt,
      },
    })

    return NextResponse.json({
      instanceId: instanceData.instanceId,
      url: instanceData.url,
      expiresAt: instanceData.expiresAt,
      ttl: INSTANCE_TTL,
    })
  } catch (e: any) {
    return jsonResponse({ detail: e.message || 'Failed to start instance' }, 500)
  }
}

function mapSlugToImage(slug: string): string {
  const map: Record<string, string> = {
    'robots-only': 'easy/robots-only',
    'cookie-monster': 'easy/cookie-monster',
    'view-source-wont-save-you': 'easy/view-source',
    'the-parameter-whisperer': 'easy/parameter-whisperer',
    'header-games': 'easy/header-games',
    'login-optional': 'easy/login-optional',
    'directory-of-secrets': 'easy/directory-of-secrets',
    'cache-me-if-you-can': 'easy/cache-me-if-you-can',
    'the-redirect-trap': 'easy/redirect-trap',
    'form-of-truth': 'easy/form-of-truth',
    'blind-as-a-bat': 'medium/blind-as-a-bat',
    'template-trouble': 'medium/template-trouble',
    'xss-marks-the-spot': 'medium/xss-marks-the-spot',
    'race-to-the-flag': 'medium/race-to-the-flag',
    'jwt-none-of-your-business': 'medium/jwt-none',
    'path-less-traveled': 'medium/path-less-traveled',
    'deserialize-this': 'medium/deserialize-this',
    'cors-you-later': 'medium/cors-you-later',
    'graphql-gauntlet': 'medium/graphql-gauntlet',
    'the-upload-zone': 'medium/the-upload-zone',
    'ssrf-to-the-cloud': 'hard/ssrf-to-the-cloud',
    'prototype-chaos': 'hard/prototype-chaos',
    'smugglers-route': 'hard/smugglers-route',
    'cache-poisoning-carnival': 'hard/cache-poisoning-carnival',
    'xxe-marks-another-spot': 'hard/xxe-marks-another-spot',
    'the-chained-exploit': 'hard/chained-exploit',
    'second-order-injection': 'hard/second-order-injection',
    'websocket-whisper': 'hard/websocket-whisper',
    'cryptic-signature': 'hard/cryptic-signature',
    'the-sandbox-escape': 'hard/sandbox-escape',
  }
  return map[slug] || `easy/${slug}`
}
