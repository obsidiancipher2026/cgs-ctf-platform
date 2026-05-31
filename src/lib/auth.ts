import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from './config'
import prisma from './prisma'

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compareSync(plainPassword, hashedPassword)
}

export async function getPasswordHash(password: string): Promise<string> {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export async function upgradePasswordHash(userId: number, plainPassword: string, currentHash: string): Promise<string> {
  if (!currentHash.startsWith('$2a$') && !currentHash.startsWith('$2b$')) {
    const newHash = await getPasswordHash(plainPassword)
    await prisma.user.update({ where: { id: userId }, data: { hashedPassword: newHash } })
    return newHash
  }
  return currentHash
}

export interface TokenPayload {
  sub: string
  role?: string
  fpr?: string
  type?: string
  exp?: number
  iat?: number
  iss?: string
  jv?: number
}

let _jwtVersion: number | null = null

export async function getJwtVersion(): Promise<number> {
  if (_jwtVersion !== null) return _jwtVersion
  try {
    const row = await prisma.securityConfig.findUnique({ where: { key: 'jwt_version' } })
    if (row) {
      _jwtVersion = parseInt(row.value, 10) || 1
    } else {
      await prisma.securityConfig.create({ data: { key: 'jwt_version', value: '1' } })
      _jwtVersion = 1
    }
  } catch {
    _jwtVersion = 1
  }
  return _jwtVersion!
}

export async function invalidateAllSessions(): Promise<void> {
  const row = await prisma.securityConfig.findUnique({ where: { key: 'jwt_version' } })
  const nextVersion = (parseInt(row?.value || '0', 10) + 1) % 1000000
  await prisma.securityConfig.upsert({
    where: { key: 'jwt_version' },
    create: { key: 'jwt_version', value: String(nextVersion) },
    update: { value: String(nextVersion) },
  })
  _jwtVersion = nextVersion
}

export async function createAccessToken(data: { sub: string; role?: string; fpr?: string }): Promise<{ token: string; version: number }> {
  const jv = await getJwtVersion()
  const payload: TokenPayload = {
    ...data,
    iat: Math.floor(Date.now() / 1000),
    iss: config.appName,
    type: 'access',
    jv,
  }
  payload.exp = Math.floor(Date.now() / 1000) + config.jwt.accessExpireMinutes * 60
  return { token: jwt.sign(payload, config.jwt.secret, { algorithm: 'HS256' }), version: jv }
}

export function createRefreshToken(data: { sub: string }): string {
  const payload: TokenPayload = {
    ...data,
    iat: Math.floor(Date.now() / 1000),
    iss: config.appName,
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + config.jwt.refreshExpireDays * 86400,
  }
  return jwt.sign(payload, config.jwt.secret, { algorithm: 'HS256' })
}

export function decodeAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as TokenPayload
    if (payload.type !== 'access') return null
    return payload
  } catch {
    return null
  }
}

export async function validateJwtVersion(payload: TokenPayload): Promise<boolean> {
  if (payload.jv === undefined) return false
  const currentVersion = await getJwtVersion()
  return payload.jv === currentVersion
}

export function decodeRefreshToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as TokenPayload
    return payload.type === 'refresh' ? payload : null
  } catch {
    return null
  }
}

export function generateFingerprint(ip: string, userAgent: string, acceptLang: string): string {
  const raw = `${ip}|${userAgent}|${acceptLang}|${getOS(userAgent)}|${getBrowser(userAgent)}`
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

function getOS(ua: string): string {
  if (ua.includes('Windows')) return 'win'
  if (ua.includes('Linux')) return 'linux'
  if (ua.includes('Mac')) return 'mac'
  if (ua.includes('Android')) return 'android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'ios'
  return 'unknown'
}

function getBrowser(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome'
  if (ua.includes('Firefox')) return 'firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Edg')) return 'edge'
  return 'unknown'
}

export function verifyFingerprintMatch(tokenFpr: string, ip: string, userAgent: string, acceptLang: string): boolean {
  const current = generateFingerprint(ip, userAgent, acceptLang)
  return tokenFpr === current
}

export interface AuthUser {
  id: number
  username: string
  email: string
  role: string
  status: string
  isBanned: boolean
  score: number
  ranking: number
  teamId: number | null
}

function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]*)/)
  if (match) return match[1]
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function authenticate(request: Request): Promise<{ user: AuthUser; error: Response | null }> {
  try {
    const tokenStr = getTokenFromRequest(request)
    if (!tokenStr) {
      return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
    }

    const payload = decodeAccessToken(tokenStr)
    if (!payload || !payload.sub) {
      return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
    }

    const versionValid = await validateJwtVersion(payload)
    if (!versionValid) {
      return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Session expired. Please login again.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
    }

    const userId = parseInt(payload.sub, 10)
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || user.status !== 'active' || user.isBanned) {
      return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'User inactive or banned' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const acceptLang = request.headers.get('accept-language') || ''

    const tokenFpr = payload.fpr || ''
    if (tokenFpr) {
      const match = verifyFingerprintMatch(tokenFpr, clientIp, userAgent, acceptLang)
      if (!match) {
        await prisma.log.create({
          data: {
            action: 'session_fingerprint_mismatch',
            userId: user.id,
            ipAddress: clientIp,
            severity: 'suspicious',
            details: JSON.stringify({ tokenFpr, userAgent: userAgent.slice(0, 200) }),
          },
        })
        if (user.role === 'admin' && config.admin.fingerprintEnforced) {
          return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Session fingerprint mismatch' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) }
        }
      }
    }

    if (user.role === 'admin' && config.admin.fingerprintEnforced && user.lastIp && user.lastIp !== clientIp) {
      await prisma.log.create({
        data: {
          action: 'admin_session_ip_change',
          userId: user.id,
          ipAddress: clientIp,
          severity: 'critical',
          details: JSON.stringify({ previousIp: user.lastIp, userAgent: userAgent.slice(0, 200) }),
        },
      })
      return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Session IP changed' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) }
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        isBanned: user.isBanned,
        score: user.score,
        ranking: user.ranking,
        teamId: user.teamId,
      },
      error: null,
    }
  } catch {
    return { user: null as unknown as AuthUser, error: new Response(JSON.stringify({ detail: 'Authentication failed' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) }
  }
}

async function sendWebhookAlert(payload: Record<string, unknown>) {
  if (!config.admin.webhookUrl) return
  try {
    await fetch(config.admin.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString(), source: 'auth-requireAdmin' }),
      signal: AbortSignal.timeout(5000),
    })
  } catch { /* silent */ }
}

export function requireAdmin(user: AuthUser | null, allowedIPs: string[], clientIp: string): Response | null {
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ detail: 'Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }
  if (allowedIPs && allowedIPs.length > 0) {
    if (!allowedIPs.includes(clientIp)) {
      prisma.log.create({
        data: { action: 'admin_ip_violation', userId: user.id, ipAddress: clientIp, severity: 'critical', details: JSON.stringify({ allowedIPs }) },
      }).catch(() => {})
      sendWebhookAlert({ action: 'ip_violation', userId: user.id, ip: clientIp, username: user.username })
      return new Response(JSON.stringify({ detail: 'Access denied from this IP address' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }
  }
  return null
}

export const REFRESH_TOKEN_COOKIE = 'refresh_token'
export const ACCESS_TOKEN_COOKIE = 'access_token'

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string): Response {
  const baseOptions = 'HttpOnly; SameSite=Strict; Path=/'
  const secureFlag = config.cookie.secure ? '; Secure' : ''
  const accessMaxAge = config.jwt.accessExpireMinutes * 60
  const refreshMaxAge = config.jwt.refreshExpireDays * 86400

  response.headers.append('Set-Cookie', `${ACCESS_TOKEN_COOKIE}=${accessToken}; Max-Age=${accessMaxAge}; ${baseOptions}${secureFlag}`)
  response.headers.append('Set-Cookie', `${REFRESH_TOKEN_COOKIE}=${refreshToken}; Max-Age=${refreshMaxAge}; ${baseOptions}${secureFlag}`)
  return response
}

export function clearAuthCookies(response: Response): Response {
  const baseOptions = 'HttpOnly; SameSite=Strict; Path=/'
  const secureFlag = config.cookie.secure ? '; Secure' : ''
  response.headers.append('Set-Cookie', `${ACCESS_TOKEN_COOKIE}=; Max-Age=0; ${baseOptions}${secureFlag}`)
  response.headers.append('Set-Cookie', `${REFRESH_TOKEN_COOKIE}=; Max-Age=0; ${baseOptions}${secureFlag}`)
  return response
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}