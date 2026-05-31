import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeText } from '@/lib/sanitizer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const flags = await prisma.realFlag.findMany({ orderBy: { createdAt: 'desc' } })
  return jsonResponse(flags.map(f => ({
    id: f.id, challenge_name: f.challengeName, flag: f.flag,
    category: f.category, notes: f.notes,
    created_at: f.createdAt, updated_at: f.updatedAt,
  })))
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/real-flags', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const { challenge_name, flag, category, notes } = body

  const realFlag = await prisma.realFlag.create({
    data: {
      challengeName: sanitizeText(challenge_name, 200),
      flag,
      category: category ? sanitizeText(category, 100) : null,
      notes: notes ? sanitizeText(notes, 2000) : null,
      createdBy: user.id,
    },
  })

  await prisma.log.create({ data: { action: 'real_flag_created', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ challenge_name }) } })
  return jsonResponse({ message: 'Real flag stored', id: realFlag.id }, 201)
}
