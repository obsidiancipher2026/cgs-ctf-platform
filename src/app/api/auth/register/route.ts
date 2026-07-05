import { z } from 'zod'
import prisma from '@/lib/prisma'
import { jsonResponse, getClientIp, setAuthCookies, createAccessToken, createRefreshToken, generateFingerprint } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitizer'
import { getPasswordHash } from '@/lib/auth'
import { wafGuard } from '@/lib/security-middleware'

const UserCreateSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(120),
  password: z.string().min(8),
  full_name: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  college: z.string().max(200).optional(),
  agreed_tos: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientIp = getClientIp(request)

    const wafResult = await wafGuard(request, '/api/auth/register', clientIp, body)
    if (wafResult?.blocked) {
      return jsonResponse({ detail: wafResult.detail }, wafResult.statusCode)
    }

    const data = UserCreateSchema.parse(body)

    if (!data.agreed_tos) {
      return jsonResponse({ detail: 'You must agree to the Terms of Service and Privacy Policy' }, 400)
    }

    const username = sanitizeText(data.username, 50)
    const email = sanitizeText(data.email, 120)
    const fullName = sanitizeText(data.full_name, 100)
    const country = sanitizeText(data.country || '', 100)
    const college = sanitizeText(data.college || '', 200)

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })
    if (existing) {
      return jsonResponse({ detail: 'Username or email already exists' }, 400)
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName: fullName,
        middleName: null,
        lastName: null,
        country: country || null,
        college: college || null,
        hashedPassword: await getPasswordHash(data.password),
        status: 'pending',
        lastIp: getClientIp(request) || null,
      },
    })

    const userAgent = request.headers.get('user-agent') || ''
    const acceptLang = request.headers.get('accept-language') || ''
    const fingerprint = generateFingerprint(clientIp, userAgent, acceptLang)
    const { token } = await createAccessToken({ sub: String(user.id), role: user.role, fpr: fingerprint })
    const refreshToken = createRefreshToken({ sub: String(user.id) })

    await prisma.log.create({
      data: {
        action: 'user_registered',
        userId: user.id,
        ipAddress: getClientIp(request),
        severity: 'info',
        details: JSON.stringify({ status: 'pending_approval' }),
      },
    })

    const response = jsonResponse({
      message: 'Registration successful! Your account is pending admin approval.',
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
    }, 201)

    setAuthCookies(response, token, refreshToken)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ detail: 'Validation error', errors: error.errors }, 400)
    }
    console.error('[Register Error]', error)
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
