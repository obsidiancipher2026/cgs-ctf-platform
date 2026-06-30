import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection('/api/admin/challenges/bulk-delete', 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  try {
    const body = await request.json()
    const { titles } = body as { titles: string[] }

    if (!Array.isArray(titles) || titles.length === 0) {
      return jsonResponse({ detail: 'titles array is required' }, 400)
    }

    const deleted: string[] = []
    for (const title of titles) {
      const challenge = await prisma.challenge.findFirst({ where: { title: { contains: title } } })
      if (challenge) {
        await prisma.submission.deleteMany({ where: { challengeId: challenge.id } })
        await prisma.challenge.delete({ where: { id: challenge.id } })
        deleted.push(challenge.title)
      }
    }

    await prisma.log.create({
      data: {
        action: 'challenges_bulk_deleted',
        userId: user.id,
        ipAddress: clientIp,
        severity: 'suspicious',
        details: JSON.stringify({ deleted, requested: titles }),
      },
    })

    return jsonResponse({ message: `Deleted ${deleted.length} challenge(s)`, deleted })
  } catch (err) {
    console.error('[Bulk Delete Challenges Error]', err)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
