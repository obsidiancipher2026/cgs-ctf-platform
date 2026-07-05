import { authenticate, jsonResponse } from '@/lib/auth'
import { generateCSRFToken } from '@/lib/csrf'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const token = generateCSRFToken(user.id)
  const response = jsonResponse({ csrf_token: token, expires_in: 3600 })
  const secureFlag = process.env.COOKIE_SECURE !== 'false' ? '; Secure' : ''
  response.headers.append('Set-Cookie', `csrf_token=${token}; Max-Age=3600; Path=/; SameSite=Strict${secureFlag}`)
  return response
}
