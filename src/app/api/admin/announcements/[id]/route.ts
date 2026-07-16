import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { sanitizeText } from '@/lib/sanitizer'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection(`/api/admin/announcements/${params.id}`, 'PUT', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const id = parseInt(params.id, 10)
    if (isNaN(id)) return jsonResponse({ detail: 'Invalid announcement ID' }, 400)
    const announcement = await prisma.announcement.findUnique({ where: { id } })
    if (!announcement) return jsonResponse({ detail: 'Announcement not found' }, 404)

    const body = await request.json().catch(() => ({}))
    const title = body.title || ''
    const message = body.message || ''

    if (!title || !message) {
      return jsonResponse({ detail: 'Title and message are required' }, 400)
    }

    await prisma.announcement.update({
      where: { id },
      data: { title: sanitizeText(title, 200), message: sanitizeText(message, 5000) },
    })
    return jsonResponse({ message: 'Announcement updated', id })
  } catch {
    return jsonResponse({ detail: 'Failed to update announcement' }, 500)
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection(`/api/admin/announcements/${params.id}`, 'DELETE', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const id = parseInt(params.id, 10)
    if (isNaN(id)) return jsonResponse({ detail: 'Invalid announcement ID' }, 400)
    const announcement = await prisma.announcement.findUnique({ where: { id } })
    if (!announcement) return jsonResponse({ detail: 'Announcement not found' }, 404)

    await prisma.announcement.delete({ where: { id } })
    return jsonResponse({ message: 'Announcement deleted', id })
  } catch {
    return jsonResponse({ detail: 'Failed to delete announcement' }, 500)
  }
}
