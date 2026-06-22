import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeText } from '@/lib/sanitizer'

const ChallengeCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.enum(['web', 'crypto', 'reverse', 'forensics', 'osint', 'pwn', 'misc']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  points: z.number().int().positive(),
  flagMode: z.enum(['static', 'dynamic_user', 'dynamic_team', 'instance']).default('static'),
  flag: z.string().optional(),
  hint: z.string().max(1000).optional(),
  maxAttempts: z.number().int().default(0),
  bloodPoints: z.number().int().min(0).optional(),
  challengeType: z.enum(['asset', 'instance']).default('asset'),
})

const BLOOD_POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 25,
  medium: 50,
  hard: 75,
  expert: 100,
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}`, 'PUT', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  try {
    const body = await request.json()
    const data = ChallengeCreateSchema.parse(body)
    const bloodPoints = data.bloodPoints ?? BLOOD_POINTS_BY_DIFFICULTY[data.difficulty] ?? 50
    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title: sanitizeText(data.title, 200),
        description: sanitizeText(data.description, 5000),
        category: data.category,
        difficulty: data.difficulty,
        points: data.points,
        flagMode: data.flagMode,
        flag: data.flag || null,
        hint: data.hint ? sanitizeText(data.hint, 1000) : null,
        maxAttempts: data.maxAttempts,
        bloodPoints,
        challengeType: data.challengeType,
      },
    })

    await prisma.log.create({ data: { action: 'challenge_updated', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ id: challengeId, title: data.title }) } })
    return jsonResponse(updated)
  } catch (error) {
    if (error instanceof z.ZodError) return jsonResponse({ detail: 'Validation error', errors: error.errors }, 400)
    console.error('[Update Challenge Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}`, 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  await prisma.log.create({ data: { action: 'challenge_deleted', userId: user.id, ipAddress: clientIp, severity: 'suspicious', details: JSON.stringify({ title: challenge.title }) } })
  await prisma.challenge.delete({ where: { id: challengeId } })
  return jsonResponse({ message: 'Challenge deleted', id: challengeId })
}
