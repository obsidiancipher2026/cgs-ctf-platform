import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const url = new URL(request.url)
  const category = url.searchParams.get('category')

  const where = category ? { category } : {}
  const challenges = await prisma.challenge.findMany({ where, orderBy: { id: 'desc' } })
  return jsonResponse(challenges)
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/challenges', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const body = await request.json()
    const { title, description, category, points, flag, hint, files, difficulty } = body
    if (!title || !description || !category || !flag) {
      return jsonResponse({ detail: 'title, description, category, and flag are required' }, 400)
    }
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        points: parseInt(points) || 100,
        flag,
        hint: hint || null,
        files: files || null,
        difficulty: difficulty || null,
      },
    })
    await prisma.log.create({ data: { action: 'challenge_created', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ title, category }) } })
    return jsonResponse(challenge)
  } catch (e) {
    return jsonResponse({ detail: 'Failed to create challenge' }, 500)
  }
}
