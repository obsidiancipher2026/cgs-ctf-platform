import { authenticate, jsonResponse } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  return jsonResponse(user)
}
