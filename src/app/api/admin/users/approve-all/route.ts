import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const result = await prisma.user.updateMany({
    where: { role: 'player', status: 'pending' },
    data: { status: 'active' },
  })

  await prisma.log.create({
    data: {
      action: 'bulk_approve_users',
      userId: user.id,
      ipAddress: clientIp,
      severity: 'info',
      details: JSON.stringify({ count: result.count }),
    },
  })

  return jsonResponse({ success: true, approved: result.count })
}
