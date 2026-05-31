import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp, verifyPassword, getPasswordHash, createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/credentials', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const { current_username, current_password, new_username, new_password } = body
  const admin = await prisma.user.findUnique({ where: { id: user.id } })

  if (!admin) return jsonResponse({ detail: 'Admin user not found' }, 404)

  if (current_username !== admin.username || !(await verifyPassword(current_password, admin.hashedPassword))) {
    return jsonResponse({ detail: "Current credentials don't match" }, 400)
  }

  const updateData: any = {}
  if (new_username) {
    const existing = await prisma.user.findFirst({ where: { username: new_username, id: { not: admin.id } } })
    if (existing) return jsonResponse({ detail: 'Username already taken' }, 400)
    updateData.username = new_username
  }
  if (new_password) {
    updateData.hashedPassword = await getPasswordHash(new_password)
  }

  const updated = await prisma.user.update({ where: { id: admin.id }, data: updateData })
  await prisma.log.create({ data: { action: 'admin_credentials_changed', userId: updated.id, ipAddress: clientIp, severity: 'suspicious' } })

  const { token: newToken } = await createAccessToken({ sub: String(updated.id), role: 'admin' })
  const newRefresh = createRefreshToken({ sub: String(updated.id) })

  const response = jsonResponse({ message: 'Admin credentials updated', username: updated.username, access_token: newToken })
  setAuthCookies(response, newToken, newRefresh)
  return response
}
