import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp, verifyPassword, getPasswordHash, getJwtVersion } from '@/lib/auth'
import { validatePasswordStrength } from '@/lib/sanitizer'
import { wafGuard } from '@/lib/security-middleware'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const body = await request.json().catch(() => ({}))

  const clientIp = getClientIp(request)
  const wafResult = await wafGuard(request, '/api/auth/change-password', clientIp, body)
  if (wafResult?.blocked) {
    return jsonResponse({ detail: wafResult.detail }, wafResult.statusCode)
  }

  const { current_password, new_password } = body

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return jsonResponse({ detail: 'User not found' }, 404)

  if (!(await verifyPassword(current_password, dbUser.hashedPassword))) {
    return jsonResponse({ detail: 'Current password is incorrect' }, 400)
  }

  const pwError = validatePasswordStrength(new_password)
  if (pwError) return jsonResponse({ detail: pwError }, 400)

  // Check that no other user has the same username
  const duplicateCheck = await prisma.user.findFirst({
    where: { username: dbUser.username, id: { not: dbUser.id } },
  })
  // This should never happen but extra safety

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword: await getPasswordHash(new_password),
      lastIp: getClientIp(request),
    },
  })

  // Bump user's jwt version so their old tokens are invalidated
  const currentVersion = await getJwtVersion()
  const userKey = `jwt_version_user_${user.id}`
  await prisma.securityConfig.upsert({
    where: { key: userKey },
    create: { key: userKey, value: String(currentVersion + 1) },
    update: { value: String(currentVersion + 1) },
  })

  await prisma.log.create({
    data: {
      action: 'password_changed',
      userId: user.id,
      ipAddress: getClientIp(request),
      severity: 'suspicious',
    },
  })

  return jsonResponse({ message: 'Password changed successfully. Please login again.' })
}
