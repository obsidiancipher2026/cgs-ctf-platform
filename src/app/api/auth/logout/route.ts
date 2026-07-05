import { authenticate, jsonResponse, clearAuthCookies, getClientIp } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  await prisma.log.create({
    data: { action: 'user_logout', userId: user.id, ipAddress: getClientIp(request), severity: 'info' },
  })

  // Invalidate user's JWT version to force re-login
  const currentVersion = await (await import('@/lib/auth')).getJwtVersion()
  const userKey = `jwt_version_user_${user.id}`
  await prisma.securityConfig.upsert({
    where: { key: userKey },
    create: { key: userKey, value: String(currentVersion + 1) },
    update: { value: String(currentVersion + 1) },
  }).catch(() => {})

  const response = jsonResponse({ detail: 'Logged out successfully' })
  clearAuthCookies(response)
  return response
}
