import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const BLOOD_BONUS: Record<string, number> = { easy: 25, medium: 50, hard: 100 }

const RATE_LIMIT_WINDOW = 5_000
const rateLimitMap = new Map<number, number>()

function getBloodBonus(difficulty: string | null): number {
  return BLOOD_BONUS[difficulty ?? ''] ?? 0
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const now = Date.now()
    const lastAttempt = rateLimitMap.get(user.id)
    if (lastAttempt && now - lastAttempt < RATE_LIMIT_WINDOW) {
      return jsonResponse({ detail: 'Too many attempts. Please wait a few seconds.' }, 429)
    }
    rateLimitMap.set(user.id, now)

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

    const trimmed = flag.trim()
    const storedFlags = await prisma.realFlag.findMany({
      where: { challengeName: challenge.title },
      select: { flag: true },
    })
    const validHashes: string[] = [challenge.flag, ...storedFlags.map(f => crypto.createHash('sha256').update(f.flag).digest('hex'))]

    // Also check per-instance unique flags
    const userInstance = await prisma.instance.findFirst({
      where: { userId: user.id, challengeId: challenge.id, status: 'running' },
      select: { flagHash: true },
    })
    if (userInstance) validHashes.push(userInstance.flagHash)

    const flagHash = crypto.createHash('sha256').update(trimmed).digest('hex')
    const match = validHashes.some(h => constantTimeEqual(flagHash, h))

    if (!match) {
      await prisma.log.create({
        data: {
          action: 'flag_submit_wrong',
          userId: user.id,
          ipAddress: getClientIp(request),
          severity: 'info',
          details: JSON.stringify({ challenge_id: challenge.id, title: challenge.title, flag_preview: trimmed.slice(0, 20) }),
        },
      }).catch(() => {})
      return jsonResponse({ detail: 'Incorrect flag' }, 400)
    }

    const existingSolves = await prisma.submission.count({
      where: { challengeId: challenge.id, solved: true },
    })
    const isFirstBlood = existingSolves === 0
    const bloodBonus = isFirstBlood ? getBloodBonus(challenge.difficulty) : 0
    const totalPoints = challenge.points + bloodBonus

    await prisma.submission.create({
      data: { userId: user.id, challengeId: challenge.id, solved: true },
    })

    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { solveCount: { increment: 1 } },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: {
        score: { increment: totalPoints },
        bloodPoints: isFirstBlood ? { increment: bloodBonus } : undefined,
      },
    })

    await prisma.log.create({
      data: {
        action: 'flag_submit_correct',
        userId: user.id,
        ipAddress: getClientIp(request),
        severity: 'info',
        details: JSON.stringify({ challenge_id: challenge.id, title: challenge.title, is_first_blood: isFirstBlood, points: totalPoints }),
      },
    })

    return jsonResponse({
      message: 'Correct flag!',
      points_awarded: challenge.points,
      first_blood: isFirstBlood,
      first_blood_bonus: bloodBonus,
      total_points_awarded: totalPoints,
    })
  } catch {
    return jsonResponse({ detail: 'Submission failed' }, 500)
  }
}
