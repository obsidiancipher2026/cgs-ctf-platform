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

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '100', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  const logs = await prisma.attackLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  const total = await prisma.attackLog.count()

  return jsonResponse({
    entries: logs.map(l => ({
      id: l.id, attack_type: l.attackType, severity: l.severity,
      ip_address: l.ipAddress, risk_score: l.riskScore,
      endpoint: l.endpoint, action_taken: l.actionTaken,
      chain_hash: l.chainHash, prev_chain_hash: l.prevChainHash,
      created_at: l.createdAt,
    })),
    total,
  })
}
