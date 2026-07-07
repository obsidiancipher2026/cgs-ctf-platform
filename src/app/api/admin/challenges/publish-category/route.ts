import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/challenges/publish-category', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const body = await request.json()
    const { category } = body
    if (!category) return jsonResponse({ detail: 'category is required' }, 400)

    const result = await prisma.challenge.updateMany({
      where: { category },
      data: { published: true },
    })
    await prisma.log.create({ data: { action: 'challenges_published', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ category, count: result.count }) } })
    return jsonResponse({ message: `Published ${result.count} challenges in ${category}`, count: result.count, category })
  } catch (e) {
    return jsonResponse({ detail: 'Failed to publish challenges' }, 500)
  }
}
