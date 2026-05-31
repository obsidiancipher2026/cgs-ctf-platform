import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, getClientIp } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitizer'

export async function PUT(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { username, email, college, country } = body

  const updateData: any = {}

  if (username && username !== user.username) {
    const existing = await prisma.user.findFirst({
      where: { username: sanitizeText(username, 50), id: { not: user.id } },
    })
    if (existing) return jsonResponse({ detail: 'Username already taken' }, 400)
    updateData.username = sanitizeText(username, 50)
  }

  if (email && email !== user.email) {
    const existing = await prisma.user.findFirst({
      where: { email: sanitizeText(email, 120), id: { not: user.id } },
    })
    if (existing) return jsonResponse({ detail: 'Email already in use' }, 400)
    updateData.email = sanitizeText(email, 120)
  }

  if (college !== undefined) updateData.college = sanitizeText(college, 200)
  if (country !== undefined) updateData.country = sanitizeText(country, 100)

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  })

  return jsonResponse({
    message: 'Profile updated',
    user: {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      score: updated.score,
      ranking: updated.ranking,
      avatarUrl: updated.avatarUrl,
      teamId: updated.teamId,
      createdAt: updated.createdAt,
      college: updated.college,
      country: updated.country,
    },
  })
}
