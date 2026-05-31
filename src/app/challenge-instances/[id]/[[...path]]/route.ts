import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  const { id, path: segments = [] } = params

  const basePath = path.join(process.cwd(), 'challenge-sites', id, ...segments)

  const tryPaths = [basePath]
  if (!path.extname(basePath)) {
    tryPaths.push(basePath + '.html')
  }

  let resolvedPath = ''
  for (const p of tryPaths) {
    try {
      const stat = fs.statSync(p)
      if (stat.isDirectory()) {
        resolvedPath = path.join(p, 'index.html')
        break
      } else if (stat.isFile()) {
        resolvedPath = p
        break
      }
    } catch {
      continue
    }
  }

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return new Response('Not Found', { status: 404 })
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8')
  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  return new Response(content, {
    headers: { 'Content-Type': contentType },
  })
}
