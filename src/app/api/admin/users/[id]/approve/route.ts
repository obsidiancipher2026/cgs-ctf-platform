import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/users/${params.id}/approve`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const userId = parseInt(params.id, 10)
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return jsonResponse({ detail: 'User not found' }, 404)
  if (target.status !== 'pending') return jsonResponse({ detail: 'User is not in pending status' }, 400)

  await prisma.user.update({ where: { id: userId }, data: { status: 'active' } })
  await prisma.log.create({
    data: { action: 'user_approved', userId, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ approvedBy: user.id, adminUsername: user.username }) },
  })
  return jsonResponse({ message: 'User approved', user_id: userId, username: target.username })
}
