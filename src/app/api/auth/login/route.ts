import { z } from 'zod'
import prisma from '@/lib/prisma'
import { config } from '@/lib/config'
import { jsonResponse, getClientIp, setAuthCookies, createAccessToken, createRefreshToken, verifyPassword, generateFingerprint, upgradePasswordHash } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitizer'
import { wafGuard } from '@/lib/security-middleware'

export const dynamic = 'force-dynamic'

const UserLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

// Item 14: HTTP Tarpit — exponentially delay failed login responses
// to slow down brute force attacks
async function tarpitDelay(clientIp: string): Promise<void> {
  if (!config.security.accountLockoutEnabled) return
  const recentFails = await prisma.log.count({
    where: {
      action: 'login_failed',
      ipAddress: clientIp,
      createdAt: { gte: new Date(Date.now() - 300000) },
    },
  })
  if (recentFails > 0) {
    // Exponential backoff: 500ms * 2^(min(fails-1, 6))
    const delayMs = Math.min(500 * Math.pow(2, Math.min(recentFails - 1, 6)), 32000)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientIp = getClientIp(request)

    const wafResult = await wafGuard(request, '/api/auth/login', clientIp, body)
    if (wafResult?.blocked) {
      return jsonResponse({ detail: wafResult.detail }, wafResult.statusCode)
    }

    const data = UserLoginSchema.parse(body)
    const username = sanitizeText(data.username, 50)
    const userAgent = request.headers.get('user-agent') || ''
    const acceptLang = request.headers.get('accept-language') || ''
    const fingerprint = generateFingerprint(clientIp, userAgent, acceptLang)

    // Item 14: Apply tarpit BEFORE querying user to prevent timing-based user enumeration
    await tarpitDelay(clientIp)

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    })

    if (!user || !(await verifyPassword(data.password, user.hashedPassword))) {
      await prisma.log.create({
        data: {
          action: 'login_failed',
          userId: user?.id || null,
          ipAddress: clientIp,
          severity: 'suspicious',
          details: JSON.stringify({ username, userAgent: userAgent.slice(0, 200), fingerprint }),
        },
      })
      return jsonResponse({ detail: 'Invalid credentials' }, 401)
    }

    if (user.isBanned) {
      await prisma.log.create({
        data: { action: 'banned_user_login_attempt', userId: user.id, ipAddress: clientIp, severity: 'suspicious', details: JSON.stringify({ userAgent: userAgent.slice(0, 200) }) },
      })
      return jsonResponse({ detail: 'Account is banned' }, 403)
    }

    if (user.status === 'pending') {
      return jsonResponse({ detail: 'Your account is pending admin approval. Please wait for an administrator to approve your account before logging in.' }, 403)
    }

    await upgradePasswordHash(user.id, data.password, user.hashedPassword)

    if (user.lastIp && user.lastIp !== clientIp) {
      await prisma.log.create({
        data: { action: 'ip_change_detected', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ previousIp: user.lastIp, newIp: clientIp }) },
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastIp: clientIp, lastLogin: new Date() },
    })

    await prisma.log.create({
      data: { action: 'user_login', userId: user.id, ipAddress: clientIp, severity: 'info', details: JSON.stringify({ fingerprint, userAgent: userAgent.slice(0, 200), acceptLanguage: acceptLang.slice(0, 50) }) },
    })

    const { token } = await createAccessToken({ sub: String(user.id), role: user.role, fpr: fingerprint })
    const refreshToken = createRefreshToken({ sub: String(user.id) })

    // Clear per-user JWT version so a previous logout doesn't block this new session
    await prisma.securityConfig.delete({ where: { key: `jwt_version_user_${user.id}` } }).catch(() => {})

    const response = jsonResponse({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        score: user.score,
        ranking: user.ranking,
        isBanned: user.isBanned,
        teamId: user.teamId,
        createdAt: user.createdAt,
      },
    })

    setAuthCookies(response, token, refreshToken)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ detail: 'Validation error', errors: error.errors }, 400)
    }
    console.error('[Login Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
