import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/users/${params.id}`, 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const userId = parseInt(params.id, 10)
  if (isNaN(userId)) return jsonResponse({ detail: 'Invalid user ID' }, 400)
  if (userId === user.id) return jsonResponse({ detail: 'Cannot delete yourself' }, 400)
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return jsonResponse({ detail: 'User not found' }, 404)

  await prisma.log.create({ data: { action: 'user_deleted', userId, ipAddress: clientIp, severity: 'suspicious', details: JSON.stringify({ deletedBy: user.id }) } })
  // Delete submissions first to avoid foreign key constraint issues
  await prisma.submission.deleteMany({ where: { userId } })
  // Clear first blood references if this user was first blood
  await prisma.challenge.updateMany({ where: { firstBloodUserId: userId }, data: { firstBloodUserId: null } })
  await prisma.user.delete({ where: { id: userId } })
  return jsonResponse({ message: 'User deleted', user_id: userId })
}
