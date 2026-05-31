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

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  return jsonResponse(announcements.map(a => ({
    id: a.id, title: a.title, message: a.message, created_at: a.createdAt,
  })))
}

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/announcements', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const url = new URL(request.url)
  const title = body.title || url.searchParams.get('title') || ''
  const message = body.message || url.searchParams.get('message') || ''

  const cleanTitle = sanitizeText(title, 200)
  const cleanMessage = sanitizeText(message, 5000)

  const announcement = await prisma.announcement.create({
    data: { title: cleanTitle, message: cleanMessage, isBroadcast: true },
  })

  await prisma.log.create({ data: { action: 'announcement_created', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ title: cleanTitle }) } })
  return jsonResponse({ message: 'Announcement created', id: announcement.id })
}
