import { authenticate, jsonResponse } from '@/lib/auth'
import { generateCSRFToken } from '@/lib/csrf'
import { config } from '@/lib/config'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const token = generateCSRFToken(user.id)
  const response = jsonResponse({ csrf_token: token, expires_in: 3600 })
  const secureFlag = config.cookie.secure ? '; Secure' : ''
  response.headers.append('Set-Cookie', `csrf_token=${token}; Max-Age=3600; Path=/; SameSite=Lax${secureFlag}`)
  return response
}
