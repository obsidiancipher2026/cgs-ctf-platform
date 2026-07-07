import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const logs = await prisma.log.findMany({
    where: {
      action: { in: ['flag_submit_correct', 'flag_submit_wrong'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean) as number[])]
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, username: true } })
    : []
  const userMap = new Map(users.map(u => [u.id, u.username]))

  const result = logs.map(l => ({
    id: l.id,
    userId: l.userId,
    username: l.userId ? userMap.get(l.userId) || 'unknown' : 'unknown',
    ipAddress: l.ipAddress,
    status: l.action === 'flag_submit_correct' ? 'correct' : 'wrong',
    details: l.details ? JSON.parse(l.details) : null,
    createdAt: l.createdAt,
  }))

  return jsonResponse(result)
}
