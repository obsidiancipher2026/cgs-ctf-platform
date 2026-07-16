import { authenticate, jsonResponse, clearAuthCookies, getClientIp, getJwtVersion, decodeRefreshToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const response = jsonResponse({ detail: 'Logged out successfully' })
  clearAuthCookies(response)

  const { user } = await authenticate(request)

  if (user) {
    await prisma.log.create({
      data: { action: 'user_logout', userId: user.id, ipAddress: getClientIp(request), severity: 'info' },
    }).catch(() => {})

    const currentVersion = await getJwtVersion()
    const userKey = `jwt_version_user_${user.id}`
    await prisma.securityConfig.upsert({
      where: { key: userKey },
      create: { key: userKey, value: String(currentVersion + 1) },
      update: { value: String(currentVersion + 1) },
    }).catch(() => {})
  }

  return response
}
