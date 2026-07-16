import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const flags = await prisma.realFlag.findMany({ orderBy: { id: 'desc' } })

  const flagsWithChallenge = await Promise.all(flags.map(async (f) => {
    const challenge = await prisma.challenge.findFirst({
      where: { title: f.challengeName },
      select: { id: true, title: true, category: true, difficulty: true, points: true, solveCount: true, updatedAt: true },
    })
    return {
      ...f,
      challengeId: challenge?.id ?? null,
      challengeTitle: challenge?.title ?? null,
      challengeCategory: challenge?.category ?? null,
      challengeDifficulty: challenge?.difficulty ?? null,
      challengePoints: challenge?.points ?? null,
      challengeSolveCount: challenge?.solveCount ?? null,
      challengeUpdatedAt: challenge?.updatedAt?.toISOString() ?? null,
    }
  }))

  return jsonResponse(flagsWithChallenge)
}

export async function POST(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection('/api/admin/real-flags', 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const body = await request.json()
    const { challenge_name, flag, category, notes } = body
    if (!challenge_name || !flag) {
      return jsonResponse({ detail: 'challenge_name and flag are required' }, 400)
    }
    const record = await prisma.realFlag.create({
      data: {
        challengeName: challenge_name,
        flag,
        category: category || null,
        notes: notes || null,
        createdBy: user.id,
      },
    })
    await prisma.log.create({ data: { action: 'real_flag_created', userId: user.id, ipAddress: clientIp, severity: 'info' } })
    return jsonResponse(record)
  } catch {
    return jsonResponse({ detail: 'Failed to create secret flag' }, 500)
  }
}
