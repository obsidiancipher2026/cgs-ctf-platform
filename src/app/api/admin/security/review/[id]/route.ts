import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    const csrfToken = request.headers.get('x-csrf-token')
    const csrfResult = csrfProtection(`/api/admin/security/review/${params.id}`, 'POST', csrfToken, user.id)
    if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

    const id = parseInt(params.id, 10)
    if (isNaN(id)) return jsonResponse({ detail: 'Invalid ID' }, 400)
    const body = await request.json().catch(() => ({}))
    const url = new URL(request.url)
    const notes = body.notes || url.searchParams.get('notes') || ''

    const entry = await prisma.attackLog.findUnique({ where: { id } })
    if (!entry) return jsonResponse({ detail: 'Attack log not found' }, 404)

    await prisma.attackLog.update({
      where: { id },
      data: { reviewed: 1, reviewedBy: user.id, notes: notes || null },
    })

    return jsonResponse({ message: 'Reviewed', id })
  } catch {
    return jsonResponse({ detail: 'Failed to review' }, 500)
  }
}
