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
  const csrfResult = csrfProtection(`/api/admin/real-flags/${params.id}`, 'PUT', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const id = parseInt(params.id, 10)
  const flag = await prisma.realFlag.findUnique({ where: { id } })
  if (!flag) return jsonResponse({ detail: 'Real flag not found' }, 404)

  const body = await request.json().catch(() => ({}))
  const { challenge_name, flag: flagValue, category, notes } = body

  await prisma.realFlag.update({
    where: { id },
    data: {
      ...(challenge_name && { challengeName: sanitizeText(challenge_name, 200) }),
      ...(flagValue && { flag: flagValue }),
      ...(category !== undefined && { category: category ? sanitizeText(category, 100) : null }),
      ...(notes !== undefined && { notes: notes ? sanitizeText(notes, 2000) : null }),
    },
  })

  return jsonResponse({ message: 'Real flag updated', id })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/real-flags/${params.id}`, 'DELETE', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const id = parseInt(params.id, 10)
  const flag = await prisma.realFlag.findUnique({ where: { id } })
  if (!flag) return jsonResponse({ detail: 'Real flag not found' }, 404)

  await prisma.realFlag.delete({ where: { id } })
  return jsonResponse({ message: 'Real flag deleted', id })
}
