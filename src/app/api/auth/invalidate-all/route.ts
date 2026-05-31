import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp, invalidateAllSessions } from '@/lib/auth'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  if (user.role !== 'admin') {
    return jsonResponse({ detail: 'Admin access required' }, 403)
  }

  try {
    await invalidateAllSessions()

    await prisma.log.create({
      data: {
        action: 'all_sessions_invalidated',
        userId: user.id,
        ipAddress: getClientIp(request),
        severity: 'suspicious',
      },
    })

    return jsonResponse({ message: 'All sessions invalidated. All users must login again.' })
  } catch {
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
