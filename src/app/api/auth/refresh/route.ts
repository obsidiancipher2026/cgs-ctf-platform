import prisma from '@/lib/prisma'
import { jsonResponse, decodeRefreshToken, createAccessToken, createRefreshToken, setAuthCookies, clearAuthCookies } from '@/lib/auth'

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]*)/)
  const refreshTokenStr = match ? match[1] : null

  if (!refreshTokenStr) {
    return jsonResponse({ detail: 'No refresh token' }, 401)
  }

  const payload = decodeRefreshToken(refreshTokenStr)
  if (!payload || !payload.sub) {
    const response = jsonResponse({ detail: 'Invalid or expired refresh token' }, 401)
    clearAuthCookies(response)
    return response
  }

  const user = await prisma.user.findUnique({ where: { id: parseInt(payload.sub, 10) } })
  if (!user || user.status !== 'active' || user.isBanned) {
    const response = jsonResponse({ detail: 'User inactive or banned' }, 401)
    clearAuthCookies(response)
    return response
  }

  const { token: newToken } = await createAccessToken({ sub: String(user.id), role: user.role })
  const newRefresh = createRefreshToken({ sub: String(user.id) })

  const response = jsonResponse({
    access_token: newToken,
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

  setAuthCookies(response, newToken, newRefresh)
  return response
}
