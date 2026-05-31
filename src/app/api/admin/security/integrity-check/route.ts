import crypto from 'crypto'
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

  const total = await prisma.attackLog.count()
  const logs = await prisma.attackLog.findMany({ orderBy: { id: 'asc' } })

  const tampered: number[] = []
  let prevHash: string | null = null
  for (const log of logs) {
    const hashInput: Record<string, unknown> = {
      attackType: log.attackType,
      severity: log.severity,
      ipAddress: log.ipAddress,
      userId: log.userId,
      riskScore: log.riskScore,
      actionTaken: log.actionTaken,
      prevHash,
      ts: log.createdAt.getTime(),
    }
    const rawHash = JSON.stringify(hashInput)
    const expectedHash = crypto.createHash('sha256').update(rawHash).digest('hex')
    if (log.chainHash !== expectedHash) {
      tampered.push(log.id)
    }
    prevHash = log.chainHash
  }

  return jsonResponse({
    chain_integrity_valid: tampered.length === 0,
    tampered_entry_ids: tampered,
    total_entries: total,
  })
}
