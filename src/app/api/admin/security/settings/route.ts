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

  const blockedIps = await prisma.attackLog.findMany({
    where: { blocked: 1 },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  })

  const whitelistedIps = await prisma.attackLog.findMany({
    where: { whitelisted: 1 },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  })

  const now = Date.now() / 1000
  const quarantined = await prisma.attackLog.findMany({
    where: { quarantineUntil: { not: null, gt: now } },
    select: { ipAddress: true, quarantineUntil: true },
    distinct: ['ipAddress'],
  })

  const quarantinedIps: Record<string, number> = {}
  for (const q of quarantined) {
    if (q.quarantineUntil) quarantinedIps[q.ipAddress] = q.quarantineUntil
  }

  return jsonResponse({
    blacklisted_ips: blockedIps.map(i => i.ipAddress),
    whitelisted_ips: whitelistedIps.map(i => i.ipAddress),
    quarantined_ips: quarantinedIps,
    active_quarantines: quarantined.length,
    rate_limits: {
      auth: { max: config.rateLimit.auth, window: config.rateLimit.window },
      admin: { max: config.rateLimit.admin, window: 60 },
    },
  })
}
