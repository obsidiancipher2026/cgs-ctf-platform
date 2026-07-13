import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const BASE_SCORES: Record<string, number> = { easy: 100, medium: 200, hard: 300, insane: 500 }

function hashFlag(flag: string) {
  return crypto.createHash('sha256').update(flag).digest('hex')
}

function getBaseScore(difficulty: string | null): number {
  return BASE_SCORES[difficulty ?? ''] ?? 100
}

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
    const { title, description, category, points, flag, hint, files, difficulty, instanceUrl } = body
    if (!title || !description || !category || !flag) {
      return jsonResponse({ detail: 'title, description, category, and flag are required' }, 400)
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const autoPoints = getBaseScore(difficulty)
    const challenge = await prisma.challenge.create({
      data: {
        title,
        slug,
        description,
        category,
        points: points !== undefined ? (parseInt(points) || autoPoints) : autoPoints,
        flag: hashFlag(flag),
        hint: hint || null,
        files: files || null,
        difficulty: difficulty || null,
        instanceUrl: instanceUrl || null,
      },
    })
    await prisma.log.create({ data: { action: 'challenge_created', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ title, category }) } })
    return jsonResponse(challenge)
  } catch (e) {
    return jsonResponse({ detail: 'Failed to create challenge' }, 500)
  }
}
