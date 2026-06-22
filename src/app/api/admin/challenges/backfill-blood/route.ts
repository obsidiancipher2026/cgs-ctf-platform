import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

const BLOOD_POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 25,
  medium: 50,
  hard: 75,
  expert: 100,
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/challenges/backfill-blood', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challenges = await prisma.challenge.findMany({
    where: { bloodPoints: 0 },
    select: { id: true, difficulty: true, title: true },
  })

  let updated = 0
  for (const c of challenges) {
    const bloodPoints = BLOOD_POINTS_BY_DIFFICULTY[c.difficulty] || 50
    await prisma.challenge.update({
      where: { id: c.id },
      data: { bloodPoints },
    })
    updated++
  }

  await prisma.log.create({
    data: {
      action: 'blood_points_backfilled',
      userId: user.id,
      ipAddress: clientIp,
      severity: 'info',
      details: JSON.stringify({ challenges_updated: updated }),
    },
  })

  return jsonResponse({
    message: `Backfilled blood points for ${updated} challenges`,
    updated,
  })
}
