import { z } from 'zod'
import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeText } from '@/lib/sanitizer'

export const dynamic = 'force-dynamic'

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
  bloodPoints: z.number().int().default(0),
  challengeType: z.enum(['asset', 'instance']).default('asset'),
})

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const challenges = await prisma.challenge.findMany({ orderBy: { id: 'asc' } })
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
    const data = ChallengeCreateSchema.parse(body)
    const challenge = await prisma.challenge.create({
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
        bloodPoints: data.bloodPoints,
        challengeType: data.challengeType,
        isPublished: true,
      },
    })

    await prisma.log.create({ data: { action: 'challenge_created', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ title: data.title }) } })
    return jsonResponse(challenge, 201)
  } catch (error) {
    if (error instanceof z.ZodError) return jsonResponse({ detail: 'Validation error', errors: error.errors }, 400)
    console.error('[Create Challenge Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
