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

  const flags = await prisma.realFlag.findMany({ orderBy: { id: 'desc' } })
  return jsonResponse(flags)
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  try {
    const body = await request.json()
    const { challenge_name, flag, category, notes } = body
    if (!challenge_name || !flag) {
      return jsonResponse({ detail: 'challenge_name and flag are required' }, 400)
    }
    const record = await prisma.realFlag.create({
      data: {
        challengeName: challenge_name,
        flag,
        category: category || null,
        notes: notes || null,
        createdBy: user.id,
      },
    })
    await prisma.log.create({ data: { action: 'real_flag_created', userId: user.id, ipAddress: clientIp, severity: 'info' } })
    return jsonResponse(record)
  } catch (e) {
    return jsonResponse({ detail: 'Failed to create secret flag' }, 500)
  }
}
