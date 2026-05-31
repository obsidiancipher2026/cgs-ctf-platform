import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp, verifyPassword, getPasswordHash, invalidateAllSessions } from '@/lib/auth'
import { validatePasswordStrength } from '@/lib/sanitizer'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const body = await request.json().catch(() => ({}))
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

  // Invalidate all sessions so user must re-login (Item 32)
  await invalidateAllSessions()

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
