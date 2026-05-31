import { authenticate, jsonResponse } from '@/lib/auth'
import { generateCSRFToken } from '@/lib/csrf'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const token = generateCSRFToken(user.id)
  return jsonResponse({ csrf_token: token, expires_in: 3600 })
}
