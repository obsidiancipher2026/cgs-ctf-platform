import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeText } from '@/lib/sanitizer'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/announcements/${params.id}`, 'PUT', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const id = parseInt(params.id, 10)
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) return jsonResponse({ detail: 'Announcement not found' }, 404)

  const body = await request.json().catch(() => ({}))
  const url = new URL(request.url)
  const title = body.title || url.searchParams.get('title') || ''
  const message = body.message || url.searchParams.get('message') || ''

  await prisma.announcement.update({
    where: { id },
    data: { title: sanitizeText(title, 200), message: sanitizeText(message, 5000) },
  })
  return jsonResponse({ message: 'Announcement updated', id })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/announcements/${params.id}`, 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const id = parseInt(params.id, 10)
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) return jsonResponse({ detail: 'Announcement not found' }, 404)

  await prisma.announcement.delete({ where: { id } })
  return jsonResponse({ message: 'Announcement deleted', id })
}
