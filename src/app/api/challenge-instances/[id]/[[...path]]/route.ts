import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest, { params }: { params: { id: string; path?: string[] } }) {
  const { id, path: filePathParts } = params
  const fileName = filePathParts?.length ? filePathParts.join('/') : 'index.html'

  const fullPath = path.join(process.cwd(), 'challenge-sites', id, fileName)

  try {
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const ext = path.extname(fileName).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain',
    }

    const content = fs.readFileSync(fullPath)
    return new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}