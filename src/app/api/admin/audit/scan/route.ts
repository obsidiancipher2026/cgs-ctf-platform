import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, requireAdmin, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminCheck = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminCheck) return adminCheck

  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { user: { select: { username: true } }, challenge: { select: { title: true, createdAt: true } } },
    })

    const anomalies: any[] = []
    const seen = new Map<string, Date>()

    for (const sub of submissions) {
      const key = `${sub.userId}-${sub.challengeId}`

      if (sub.isCorrect) {
        const deployTime = sub.challenge.createdAt.getTime()
        const submitTime = sub.createdAt.getTime()
        if (submitTime - deployTime < 50) {
          anomalies.push({ type: 'too_fast', user: sub.user.username, challenge: sub.challenge.title, time: sub.createdAt, detail: 'Submitted <50ms after deploy' })
        }
      }

      if (seen.has(key)) {
        const prev = seen.get(key)!
        if (Math.abs(sub.createdAt.getTime() - prev.getTime()) < 100) {
          anomalies.push({ type: 'double_submit', user: sub.user.username, challenge: sub.challenge.title, time: sub.createdAt, detail: 'Two submissions within 100ms' })
        }
      }
      seen.set(key, sub.createdAt)

      if (sub.isCorrect) {
        const similar = submissions.filter(s =>
          s.isCorrect && s.id !== sub.id &&
          s.flagProvided === sub.flagProvided &&
          s.challengeId === sub.challengeId
        )
        if (similar.length > 0) {
          anomalies.push({ type: 'identical_flag', user: sub.user.username, challenge: sub.challenge.title, time: sub.createdAt, detail: `Flag matches ${similar.length} other submission(s)` })
        }
      }
    }

    return jsonResponse({ anomalies, total_checked: submissions.length, scan_time: new Date().toISOString() })
  } catch {
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
