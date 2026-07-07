import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const body = await request.json()
    const { challenge_id, flag } = body

    if (!challenge_id || !flag) {
      return jsonResponse({ detail: 'challenge_id and flag are required' }, 400)
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: parseInt(challenge_id) } })
    if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)
    if (!challenge.published) return jsonResponse({ detail: 'Challenge is not available' }, 403)

    const existing = await prisma.submission.findUnique({
      where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
    })
    if (existing) return jsonResponse({ detail: 'Already solved this challenge' }, 409)

    const hashed = crypto.createHash('sha256').update(flag.trim()).digest('hex')
    if (hashed !== challenge.flag) {
      return jsonResponse({ detail: 'Incorrect flag' }, 400)
    }

    await prisma.submission.create({
      data: { userId: user.id, challengeId: challenge.id, solved: true },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { score: { increment: challenge.points } },
    })

    await prisma.log.create({
      data: { action: 'challenge_solved', userId: user.id, ipAddress: getClientIp(request), severity: 'info', details: JSON.stringify({ challenge_id: challenge.id, title: challenge.title }) },
    })

    return jsonResponse({ message: 'Correct flag!', points_awarded: challenge.points })
  } catch {
    return jsonResponse({ detail: 'Submission failed' }, 500)
  }
}
