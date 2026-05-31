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

  const totalAttacks = await prisma.attackLog.count()
  const criticalCount = await prisma.attackLog.count({ where: { severity: 'critical' } })
  const highCount = await prisma.attackLog.count({ where: { severity: 'high' } })
  const mediumCount = await prisma.attackLog.count({ where: { severity: 'medium' } })
  const lowCount = await prisma.attackLog.count({ where: { severity: 'low' } })
  const blockedCount = await prisma.attackLog.count({ where: { blocked: 1 } })
  const whitelistedCount = await prisma.attackLog.count({ where: { whitelisted: 1 } })
  const pendingReview = await prisma.attackLog.count({ where: { reviewed: 0 } })

  const uniqueIPsResult = await prisma.attackLog.findMany({
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  })

  const topAttackTypes = await prisma.attackLog.groupBy({
    by: ['attackType'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const recentLogs = await prisma.attackLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return jsonResponse({
    total_attacks: totalAttacks,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    blocked_count: blockedCount,
    whitelisted_count: whitelistedCount,
    pending_review_count: pendingReview,
    unique_ips: uniqueIPsResult.length,
    top_attack_types: topAttackTypes.map(t => ({ type: t.attackType, count: t._count.id })),
    recent_attacks: recentLogs.map(l => ({
      id: l.id, attack_type: l.attackType, severity: l.severity,
      ip_address: l.ipAddress, user_id: l.userId, risk_score: l.riskScore,
      endpoint: l.endpoint, action_taken: l.actionTaken, created_at: l.createdAt,
    })),
  })
}
