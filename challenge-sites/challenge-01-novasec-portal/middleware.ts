import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-NovaSec-Secret', 'CGS{h3ad3rs_sp34k_l0ud3r_th4n_p4g3s}')
  return response
}

export const config = {
  matcher: '/:path*',
}
