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

  const url = new URL(request.url)
  const severity = url.searchParams.get('severity')
  const attack_type = url.searchParams.get('attack_type')
  const ip = url.searchParams.get('ip')
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  const where: any = {}
  if (severity) where.severity = severity
  if (attack_type) where.attackType = { contains: attack_type }
  if (ip) where.ipAddress = ip

  const logs = await prisma.attackLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  const total = await prisma.attackLog.count({ where })

  return jsonResponse({
    entries: logs.map(l => ({
      id: l.id, attack_type: l.attackType, severity: l.severity,
      ip_address: l.ipAddress, user_id: l.userId, username: l.username,
      fingerprint: l.fingerprint, risk_score: l.riskScore,
      endpoint: l.endpoint, method: l.method,
      user_agent: l.userAgent, payload_snapshot: l.payloadSnapshot,
      country: l.country, action_taken: l.actionTaken,
      quarantine_until: l.quarantineUntil, blocked: l.blocked,
      whitelisted: l.whitelisted, reviewed: l.reviewed,
      chain_hash: l.chainHash, prev_chain_hash: l.prevChainHash,
      created_at: l.createdAt,
    })),
    total,
  })
}

export async function DELETE(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/security/logs', 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  await prisma.attackLog.deleteMany()
  await prisma.log.create({
    data: { action: 'security_logs_cleared', userId: user.id, ipAddress: clientIp, severity: 'info' },
  })
  return jsonResponse({ message: 'All attack logs cleared' })
}
