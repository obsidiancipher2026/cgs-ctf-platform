import { authenticate, jsonResponse, clearAuthCookies, getClientIp } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  await prisma.log.create({
    data: { action: 'user_logout', userId: user.id, ipAddress: getClientIp(request), severity: 'info' },
  })

  const response = jsonResponse({ detail: 'Logged out successfully' })
  clearAuthCookies(response)
  return response
}
