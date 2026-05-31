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
      take: 1000,
      include: { user: { select: { username: true, teamId: true } } },
    })

    const flagged: any[] = []

    const ipGroups = new Map<string, Set<number>>()
    for (const sub of submissions) {
      if (!sub.ipAddress) continue
      if (!ipGroups.has(sub.ipAddress)) ipGroups.set(sub.ipAddress, new Set())
      ipGroups.get(sub.ipAddress)!.add(sub.userId)
    }
    for (const [ip, userIds] of ipGroups) {
      if (userIds.size > 1) {
        flagged.push({ type: 'shared_ip', ip, user_count: userIds.size, user_ids: Array.from(userIds), detail: `${userIds.size} users sharing IP ${ip}` })
      }
    }

    const userFlagSeq = new Map<number, string[]>()
    for (const sub of submissions) {
      if (!userFlagSeq.has(sub.userId)) userFlagSeq.set(sub.userId, [])
      userFlagSeq.get(sub.userId)!.push(sub.flagProvided || '')
    }
    const seqGroups = new Map<string, number[]>()
    for (const [uid, seq] of userFlagSeq) {
      const key = seq.join('|')
      if (!seqGroups.has(key)) seqGroups.set(key, [])
      seqGroups.get(key)!.push(uid)
    }
    for (const [, uids] of seqGroups) {
      if (uids.length > 1) {
        flagged.push({ type: 'identical_sequence', user_count: uids.length, user_ids: uids, detail: `${uids.length} users with identical submission sequences` })
      }
    }

    return jsonResponse({ flagged, total_checked: submissions.length, scan_time: new Date().toISOString() })
  } catch {
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
