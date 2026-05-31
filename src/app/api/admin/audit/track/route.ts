import prisma from '@/lib/prisma'
import { authenticate, jsonResponse, requireAdmin, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminCheck = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { team_id, challenge_id } = body

    if (!team_id || !challenge_id) {
      return jsonResponse({ detail: 'team_id and challenge_id required' }, 400)
    }

    const recentDeploy = await prisma.log.findFirst({
      where: { action: 'challenge_deployed', userId: challenge_id, createdAt: { gte: new Date(Date.now() - 60000) } },
    })
    const deployLag = recentDeploy ? Date.now() - recentDeploy.createdAt.getTime() : 999999
    const anomalyScore = deployLag < 50 ? 1.0 : deployLag < 5000 ? 0.3 : 0.0

    await prisma.log.create({
      data: {
        action: 'audit_track',
        userId: team_id,
        ipAddress: clientIp,
        severity: anomalyScore > 0.5 ? 'suspicious' : 'info',
        details: JSON.stringify({ challenge_id, anomalyScore, deployLagMs: deployLag }),
      },
    })

    return jsonResponse({ tracked: true, anomaly_score: anomalyScore, deploy_lag_ms: deployLag })
  } catch {
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
