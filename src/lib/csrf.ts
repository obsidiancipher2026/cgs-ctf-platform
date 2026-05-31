import crypto from 'crypto'
import { config } from './config'

const CSRF_TOKEN_SECRET = config.jwt.secret + ':csrf:v2'

export function generateCSRFToken(userId: number): string {
  const ts = Math.floor(Date.now() / 1000).toString()
  const msg = `${userId}:${ts}:${CSRF_TOKEN_SECRET}`
  const sig = crypto.createHmac('sha256', CSRF_TOKEN_SECRET).update(msg).digest('hex').slice(0, 16)
  return `${ts}:${sig}`
}

export function validateCSRFToken(token: string, userId: number, maxAge: number = 3600): boolean {
  try {
    const parts = token.split(':')
    if (parts.length !== 2) return false
    const [tsStr, sig] = parts
    const ts = parseInt(tsStr, 10)
    if (Date.now() / 1000 - ts > maxAge) return false
    const msg = `${userId}:${tsStr}:${CSRF_TOKEN_SECRET}`
    const expected = crypto.createHmac('sha256', CSRF_TOKEN_SECRET).update(msg).digest('hex').slice(0, 16)
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export function csrfProtection(path: string, method: string, csrfToken: string | null, userId: number | undefined): { valid: boolean; reason?: string } {
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }

  if (!path.startsWith('/api/admin/')) {
    return { valid: true }
  }

  if (!userId) {
    return { valid: false, reason: 'Authentication required for CSRF validation' }
  }

  if (!csrfToken || !validateCSRFToken(csrfToken, userId)) {
    return { valid: false, reason: 'Invalid or missing CSRF token' }
  }

  return { valid: true }
}
