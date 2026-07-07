import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'

const INSTANCE_SERVER_URL = process.env.INSTANCE_SERVER_URL || 'http://localhost:3100'

async function proxy(request: NextRequest, params: { path: string[] }, method: string) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const path = params.path.join('/')
  const url = `${INSTANCE_SERVER_URL}/api/${path}${new URL(request.url).search}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': String(user.id),
    }
    if (process.env.INSTANCE_SERVER_KEY) {
      headers['X-API-Key'] = process.env.INSTANCE_SERVER_KEY
    }

    const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.text()

    const res = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    })

    const data = await res.text()
    const contentType = res.headers.get('Content-Type') || 'application/json'

    if (contentType.includes('text/event-stream')) {
      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader()
          if (!reader) { controller.close(); return }
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) { controller.close(); break }
              controller.enqueue(value)
            }
          } catch { controller.close() }
        },
      })
      return new NextResponse(stream, {
        status: res.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    })
  } catch {
    return NextResponse.json({ detail: 'Instance server unavailable' }, { status: 503 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params, 'POST')
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params, 'DELETE')
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params, 'PUT')
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params, 'PATCH')
}
