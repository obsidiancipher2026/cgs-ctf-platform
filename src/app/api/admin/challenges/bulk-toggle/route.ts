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
  const csrfResult = csrfProtection('/api/admin/challenges/bulk-toggle', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const body = await request.json().catch(() => ({}))
  const { action, category, difficulty } = body

  if (!action || !['publish', 'unpublish'].includes(action)) {
    return jsonResponse({ detail: 'action must be "publish" or "unpublish"' }, 400)
  }

  const where: any = {}
  if (category) where.category = category
  if (difficulty) where.difficulty = difficulty

  try {
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.challenge.count({ where })
      await tx.challenge.updateMany({
        where,
        data: { isPublished: action === 'publish' },
      })
      await tx.log.create({
        data: {
          action: `bulk_${action}`,
          userId: user.id,
          ipAddress: clientIp,
          severity: 'info',
          details: JSON.stringify({ category, difficulty, count, action }),
        },
      })
      return { count }
    })

    const label = [category, difficulty].filter(Boolean).join('/') || 'all challenges'
    return jsonResponse({
      message: `${action === 'publish' ? 'Published' : 'Unpublished'} ${result.count} ${label} challenges`,
      count: result.count,
    })
  } catch (error) {
    return jsonResponse({ detail: 'Bulk toggle failed', error: String(error) }, 500)
  }
}
