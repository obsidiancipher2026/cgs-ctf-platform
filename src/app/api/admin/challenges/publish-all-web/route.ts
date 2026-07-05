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
  const csrfResult = csrfProtection('/api/admin/challenges/publish-all-web', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const challenges = await tx.challenge.findMany({
        where: { category: 'web' },
      })

      await tx.challenge.updateMany({
        where: { category: 'web' },
        data: { status: 'published' },
      })

      await tx.log.create({
        data: {
          action: 'bulk_publish_web',
          userId: user.id,
          ipAddress: clientIp,
          severity: 'suspicious',
          details: JSON.stringify({
            adminId: user.id,
            count: challenges.length,
            timestamp: new Date().toISOString(),
          }),
        },
      })

      return { count: challenges.length }
    })

    return jsonResponse({ message: `Published ${result.count} Web challenges`, count: result.count })
  } catch (error) {
    console.error('[PublishAllWeb Error]', error)
    return jsonResponse({ detail: 'Bulk publish failed', error: String(error) }, 500)
  }
}
