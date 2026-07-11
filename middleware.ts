import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminAccessToken } from '@/lib/edge-auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/about', '/announcements', '/challenges', '/maintenance']

const MAINTENANCE_EXEMPT_PATHS = [
  '/maintenance',
  '/api/maintenance',
  '/lenaPretsaMdliuG',
  '/api/auth/admin/login',
  '/api/auth/refresh',
  '/api/auth/csrf-token',
  '/api/auth/logout',
]

function isMaintenanceExempt(pathname: string): boolean {
  return MAINTENANCE_EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

async function fetchMaintenanceStatus(request: NextRequest): Promise<{ enabled: boolean; message: string }> {
  try {
    const res = await fetch(new URL('/api/maintenance', request.url), {
      cache: 'no-store',
      headers: { 'x-maintenance-check': '1' },
    })
    if (!res.ok) return { enabled: false, message: '' }
    return await res.json()
  } catch {
    return { enabled: false, message: '' }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  const isDev = process.env.NODE_ENV === 'development'
  const isAdminPath = pathname.startsWith('/lenaPretsaMdliuG')
  const csp = [
    "default-src 'self'",
    isDev || isAdminPath ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  const origin = request.headers.get('origin')
  if (origin) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
  }

  if (!isMaintenanceExempt(pathname)) {
    const maintenance = await fetchMaintenanceStatus(request)
    if (maintenance.enabled) {
      const accessToken = request.cookies.get('access_token')?.value
      const jwtSecret = process.env.JWT_SECRET
      const isAdmin =
        !!accessToken && !!jwtSecret && (await isAdminAccessToken(accessToken, jwtSecret))

      if (!isAdmin) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              detail: 'Site is under maintenance',
              message: maintenance.message,
            },
            { status: 503 },
          )
        }

        const maintUrl = new URL('/maintenance', request.url)
        if (maintenance.message) {
          maintUrl.searchParams.set('msg', maintenance.message)
        }
        return NextResponse.redirect(maintUrl)
      }
    }
  }

  const accessToken = request.cookies.get('access_token')?.value
  const isPublic = PUBLIC_PATHS.includes(pathname)

  if (!accessToken && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (accessToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
