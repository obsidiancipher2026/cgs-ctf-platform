import prisma from '@/lib/prisma'
import { config } from '@/lib/config'
import { authenticate, jsonResponse, getClientIp } from '@/lib/auth'
import { validateFlagStrict } from '@/lib/sanitizer'
import { recalculateRankings } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

const SUBMISSION_COOLDOWN = config.security.submissionCooldownSeconds * 1000
const MAX_SUBMISSIONS_PER_MINUTE = parseInt(process.env.MAX_SUBMISSIONS_PER_MINUTE || '5', 10)

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  try {
    const body = await request.json()
    const { challenge_id, flag } = body
    const clientIp = getClientIp(request)

    if (!challenge_id || !flag) {
      return jsonResponse({ detail: 'Challenge ID and flag are required' }, 400)
    }

    const flagValidation = validateFlagStrict(flag)
    if (!flagValidation.valid) {
      return jsonResponse({ detail: flagValidation.reason }, 400)
    }

    // Item 31: Per-minute rate limit on all submissions
    const recentSubmissions = await prisma.submission.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60000) },
      },
    })
    if (recentSubmissions >= MAX_SUBMISSIONS_PER_MINUTE) {
      return jsonResponse({ detail: `Submission rate limit exceeded. Max ${MAX_SUBMISSIONS_PER_MINUTE} per minute.` }, 429)
    }

    const challenge = await prisma.challenge.findFirst({
      where: { id: challenge_id, isPublished: true },
    })

    if (!challenge) {
      return jsonResponse({ detail: 'Challenge not found' }, 404)
    }

    const alreadySolved = await prisma.submission.findFirst({
      where: { challengeId: challenge_id, userId: user.id, isCorrect: true },
    })
    if (alreadySolved) {
      return jsonResponse({ detail: 'Challenge already solved' }, 400)
    }

    if (challenge.maxAttempts > 0) {
      const attemptCount = await prisma.submission.count({
        where: { challengeId: challenge_id, userId: user.id },
      })
      if (attemptCount >= challenge.maxAttempts) {
        return jsonResponse({ detail: 'Maximum attempts reached' }, 400)
      }
    }

    if (SUBMISSION_COOLDOWN > 0) {
      const lastSubmission = await prisma.submission.findFirst({
        where: { userId: user.id, isCorrect: false },
        orderBy: { createdAt: 'desc' },
      })
      if (lastSubmission) {
        const elapsed = Date.now() - lastSubmission.createdAt.getTime()
        if (elapsed < SUBMISSION_COOLDOWN) {
          const waitSeconds = Math.ceil((SUBMISSION_COOLDOWN - elapsed) / 1000)
          return jsonResponse({ detail: `Please wait ${waitSeconds}s before submitting again.` }, 429)
        }
      }
    }

    let isCorrect = false
    if (challenge.flagMode === 'static' && challenge.flag) {
      isCorrect = flag.trim() === challenge.flag.trim()
    } else {
      isCorrect = flag.trim() === challenge.flag?.trim()
    }

    if (isCorrect) {
      const result = await prisma.$transaction(async (tx) => {
        const correctCount = await tx.submission.count({
          where: { challengeId: challenge_id, isCorrect: true },
        })
        const isFirstBlood = correctCount === 0

        const pointsToAward = challenge.points + (isFirstBlood ? challenge.bloodPoints : 0)

        await tx.submission.create({
          data: {
            challengeId: challenge_id,
            userId: user.id,
            teamId: user.teamId || null,
            flagProvided: flag,
            isCorrect: true,
            ipAddress: clientIp,
          },
        })

        await tx.user.update({
          where: { id: user.id },
          data: { score: { increment: pointsToAward } },
        })

        await tx.challenge.update({
          where: { id: challenge_id },
          data: {
            solverCount: { increment: 1 },
            ...(isFirstBlood ? { firstBloodUserId: user.id } : {}),
          },
        })

        return { pointsToAward, isFirstBlood }
      })

      await prisma.log.create({
        data: {
          action: 'flag_submitted',
          userId: user.id,
          ipAddress: clientIp,
          severity: 'info',
          details: JSON.stringify({ challenge_id, correct: true, first_blood: result.isFirstBlood }),
        },
      })

      await recalculateRankings()

      return jsonResponse({
        correct: true,
        message: result.isFirstBlood ? 'Correct flag! First blood + bonus!' : 'Correct flag! Points awarded.',
        points_awarded: result.pointsToAward,
        first_blood: result.isFirstBlood,
      })
    } else {
      await prisma.submission.create({
        data: {
          challengeId: challenge_id,
          userId: user.id,
          teamId: user.teamId || null,
          flagProvided: flag,
          isCorrect: false,
          ipAddress: clientIp,
        },
      })

      await prisma.log.create({
        data: {
          action: 'flag_submitted',
          userId: user.id,
          ipAddress: clientIp,
          severity: 'suspicious',
          details: JSON.stringify({ challenge_id, correct: false }),
        },
      })

      return jsonResponse({
        correct: false,
        message: 'Incorrect flag. Try again.',
      })
    }
  } catch (error) {
    console.error('[Submission Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { challenge: { select: { title: true, points: true, firstBloodUserId: true } } },
  })

  return jsonResponse(submissions.map(s => ({
    id: s.id,
    challenge_id: s.challengeId,
    challenge_title: s.challenge.title,
    challenge_points: s.challenge.points,
    flag_provided: s.flagProvided,
    is_correct: s.isCorrect,
    is_first_blood: s.isCorrect && s.challenge.firstBloodUserId === user.id,
    created_at: s.createdAt,
  })))
}
