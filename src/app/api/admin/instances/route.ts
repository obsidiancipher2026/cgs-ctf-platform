import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

const INSTANCE_SERVER_URL = process.env.INSTANCE_SERVER_URL || 'http://localhost:3100'

export async function GET(request: Request) {
  try {
    const { user, error } = await authenticate(request)
    if (error) return error

    const clientIp = getClientIp(request)
    const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
    if (adminErr) return adminErr

    // DB counts
    const totalInstances = await prisma.challengeInstance.count()
    const runningInstances = await prisma.challengeInstance.count({ where: { status: 'running' } })
    const expiredInstances = await prisma.challengeInstance.count({ where: { status: 'expired' } })
    const erroredInstances = await prisma.challengeInstance.count({ where: { status: 'error' } })

    // Active instances from DB
    const activeInstances = await prisma.challengeInstance.findMany({
      where: { status: 'running' },
      include: {
        user: { select: { id: true, username: true } },
        challenge: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { expirationTime: 'asc' },
      take: 100,
    })

    // Try to get orchestrator metrics
    let orchestratorMetrics = null
    try {
      const res = await fetch(`${INSTANCE_SERVER_URL}/api/admin/metrics`, {
        headers: { 'X-API-Key': process.env.INSTANCE_SERVER_KEY || '' },
      })
      if (res.ok) orchestratorMetrics = await res.json()
    } catch {}

    return jsonResponse({
      total: totalInstances,
      running: runningInstances,
      expired: expiredInstances,
      error: erroredInstances,
      activeInstances: activeInstances.map(i => ({
        id: i.id,
        userId: i.userId,
        username: i.user.username,
        challengeId: i.challengeId,
        challengeSlug: i.challenge.slug,
        challengeTitle: i.challenge.title,
        status: i.status,
        url: i.url,
        token: i.token?.slice(0, 12) + '...',
        expiresAt: i.expirationTime,
        containerId: i.containerId?.slice(0, 12) || null,
        flag: i.flag?.slice(0, 20) + '...',
      })),
      orchestrator: orchestratorMetrics,
    })
  } catch {
    return jsonResponse({ detail: 'Failed to load instance stats' }, 500)
  }
}
