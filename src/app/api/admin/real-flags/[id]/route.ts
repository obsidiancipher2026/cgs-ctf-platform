import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

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
  const existing = await prisma.realFlag.findUnique({ where: { id } })
  if (!existing) return jsonResponse({ detail: 'Secret flag not found' }, 404)

  try {
    const body = await request.json()
    const record = await prisma.realFlag.update({
      where: { id },
      data: {
        challengeName: body.challenge_name ?? existing.challengeName,
        flag: body.flag ?? existing.flag,
        category: body.category !== undefined ? (body.category || null) : existing.category,
        notes: body.notes !== undefined ? (body.notes || null) : existing.notes,
      },
    })
    return jsonResponse(record)
  } catch (e) {
    return jsonResponse({ detail: 'Failed to update secret flag' }, 500)
  }
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
  const existing = await prisma.realFlag.findUnique({ where: { id } })
  if (!existing) return jsonResponse({ detail: 'Secret flag not found' }, 404)

  await prisma.realFlag.delete({ where: { id } })
  return jsonResponse({ message: 'Secret flag deleted' })
}
