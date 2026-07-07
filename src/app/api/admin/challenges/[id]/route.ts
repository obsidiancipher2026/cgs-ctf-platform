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
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}`, 'PUT', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const id = parseInt(params.id, 10)
  const existing = await prisma.challenge.findUnique({ where: { id } })
  if (!existing) return jsonResponse({ detail: 'Challenge not found' }, 404)

  try {
    const body = await request.json()
    const challenge = await prisma.challenge.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        points: body.points !== undefined ? parseInt(body.points) : existing.points,
        flag: body.flag ?? existing.flag,
        hint: body.hint !== undefined ? (body.hint || null) : existing.hint,
        files: body.files !== undefined ? (body.files || null) : existing.files,
        difficulty: body.difficulty !== undefined ? (body.difficulty || null) : existing.difficulty,
        published: body.published !== undefined ? body.published : existing.published,
        instanceUrl: body.instanceUrl !== undefined ? (body.instanceUrl || null) : existing.instanceUrl,
      },
    })
    return jsonResponse(challenge)
  } catch (e) {
    return jsonResponse({ detail: 'Failed to update challenge' }, 500)
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

  const id = parseInt(params.id, 10)
  const existing = await prisma.challenge.findUnique({ where: { id } })
  if (!existing) return jsonResponse({ detail: 'Challenge not found' }, 404)

  await prisma.challenge.delete({ where: { id } })
  return jsonResponse({ message: 'Challenge deleted' })
}
