import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { config } from '@/lib/config'
import { jsonResponse, getClientIp, setAuthCookies, createAccessToken, createRefreshToken, verifyPassword, getPasswordHash, generateFingerprint } from '@/lib/auth'
import { wafGuard } from '@/lib/security-middleware'

// HTTP Tarpit for admin login — exponential backoff on failed attempts
// Mirrors the protection on the regular user login endpoint
async function tarpitDelay(clientIp: string): Promise<void> {
  if (!config.security.accountLockoutEnabled) return
  const recentFails = await prisma.log.count({
    where: {
      action: 'admin_login_failed',
      ipAddress: clientIp,
      createdAt: { gte: new Date(Date.now() - 300000) },
    },
  })
  if (recentFails > 0) {
    const delayMs = Math.min(500 * Math.pow(2, Math.min(recentFails - 1, 6)), 32000)
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password, access_key } = body

    if (!password || !access_key) {
      return jsonResponse({ detail: 'Password and secret key are required' }, 400)
    }

    const clientIp = getClientIp(request)

    const wafResult = await wafGuard(request, '/api/auth/admin/login', clientIp, body)
    if (wafResult?.blocked) {
      return jsonResponse({ detail: wafResult.detail }, wafResult.statusCode)
    }

    const userAgent = request.headers.get('user-agent') || ''
    const acceptLang = request.headers.get('accept-language') || ''
    const fingerprint = generateFingerprint(clientIp, userAgent, acceptLang)

    // Apply tarpit BEFORE credential checks to slow brute-force attacks
    await tarpitDelay(clientIp)

    const keyBuf = Buffer.from(access_key)
    const expectedBuf = Buffer.from(config.admin.accessKey)
    const keysMatch = keyBuf.length === expectedBuf.length && crypto.timingSafeEqual(keyBuf, expectedBuf)
    if (!keysMatch) {
      await prisma.log.create({
        data: {
          action: 'admin_login_failed',
          ipAddress: clientIp,
          severity: 'critical',
          details: JSON.stringify({ reason: 'invalid_access_key', userAgent: userAgent.slice(0, 200), fingerprint }),
        },
      })
      return jsonResponse({ detail: 'Invalid secret key' }, 401)
    }

    const adminUsername = config.admin.username
    let admin = await prisma.user.findUnique({ where: { username: adminUsername } })

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          username: adminUsername,
          email: config.admin.email || 'admin@cyberguardians.io',
          hashedPassword: await getPasswordHash(config.admin.password),
          role: 'admin',
          status: 'active',
        },
      })
    }

    if (admin.status !== 'active' || admin.isBanned) {
      return jsonResponse({ detail: 'Admin account is inactive or banned' }, 403)
    }

    if (!(await verifyPassword(password, admin.hashedPassword))) {
      // Check if this is a plaintext migration path (env password matches but hash is stale)
      if (password === config.admin.password) {
        admin = await prisma.user.update({
          where: { id: admin.id },
          data: { hashedPassword: await getPasswordHash(password) },
        })
      } else {
        await prisma.log.create({
          data: {
            action: 'admin_login_failed',
            userId: admin.id,
            ipAddress: clientIp,
            severity: 'critical',
            details: JSON.stringify({ reason: 'invalid_password', userAgent: userAgent.slice(0, 200), fingerprint }),
          },
        })
        return jsonResponse({ detail: 'Invalid password' }, 401)
      }
    }

    const tokenResult = await createAccessToken({ sub: String(admin.id), role: 'admin', fpr: fingerprint })
    const refreshToken = createRefreshToken({ sub: String(admin.id) })

    await prisma.user.update({
      where: { id: admin.id },
      data: { lastIp: clientIp, lastLogin: new Date() },
    })

    await prisma.log.create({
      data: {
        action: 'admin_login',
        userId: admin.id,
        ipAddress: clientIp,
        severity: 'info',
        details: JSON.stringify({ fingerprint, userAgent: userAgent.slice(0, 200), acceptLanguage: acceptLang.slice(0, 50) }),
      },
    })

    const response = jsonResponse({
      access_token: tokenResult.token,
      token_type: 'bearer',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        avatar_url: admin.avatarUrl,
        role: admin.role,
        status: admin.status,
        score: admin.score,
        ranking: admin.ranking,
        team_id: admin.teamId,
      },
    })

    setAuthCookies(response, tokenResult.token, refreshToken)
    return response
  } catch (error) {
    console.error('[Admin Login Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
