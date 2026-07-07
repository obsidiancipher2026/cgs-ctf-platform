import { NextRequest, NextResponse } from 'next/server'

const INSTANCE_SERVER_URL = process.env.INSTANCE_SERVER_URL || 'http://localhost:3100'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `${INSTANCE_SERVER_URL}/api/instances/${path}${new URL(request.url).search}`

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ detail: 'Instance server unavailable' }, { status: 503 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const url = `${INSTANCE_SERVER_URL}/api/instances/${path}`

  try {
    const body = await request.text()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ detail: 'Instance server unavailable' }, { status: 503 })
  }
}
