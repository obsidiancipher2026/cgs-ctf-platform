import prisma from '@/lib/prisma'
import { config } from '@/lib/config'
import { jsonResponse, getClientIp, setAuthCookies, createAccessToken, createRefreshToken, verifyPassword, getPasswordHash, generateFingerprint } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password, access_key } = body

    if (!password || !access_key) {
      return jsonResponse({ detail: 'Password and secret key are required' }, 400)
    }

    if (access_key !== config.admin.accessKey) {
      return jsonResponse({ detail: 'Invalid secret key' }, 401)
    }

    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const acceptLang = request.headers.get('accept-language') || ''

    const adminUsername = config.admin.username
    let admin = await prisma.user.findUnique({ where: { username: adminUsername } })

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          username: adminUsername,
          email: config.admin.email || 'admin@cyberguardians.io',
          hashedPassword: await getPasswordHash(config.admin.password || ''),
          role: 'admin',
          status: 'active',
        },
      })
    }

    if (admin.status !== 'active' || admin.isBanned) {
      return jsonResponse({ detail: 'Admin account is inactive or banned' }, 403)
    }

    if (!(await verifyPassword(password, admin.hashedPassword))) {
      if (config.admin.password && password === config.admin.password) {
        admin = await prisma.user.update({
          where: { id: admin.id },
          data: { hashedPassword: await getPasswordHash(password) },
        })
      } else {
        return jsonResponse({ detail: 'Invalid password' }, 401)
      }
    }

    const fingerprint = generateFingerprint(clientIp, userAgent, acceptLang)

    await prisma.user.update({
      where: { id: admin.id },
      data: { lastIp: clientIp, lastLogin: new Date() },
    })

    const { token } = await createAccessToken({ sub: String(admin.id), role: 'admin', fpr: fingerprint })
    const refreshToken = createRefreshToken({ sub: String(admin.id) })

    const response = jsonResponse({
      access_token: token,
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

    setAuthCookies(response, token, refreshToken)
    return response
  } catch (error) {
    console.error('[Admin Login Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
