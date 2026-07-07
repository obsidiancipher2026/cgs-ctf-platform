import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const CHALLENGES_DIR = path.join(process.cwd(), 'challenges')

function getChallengeDir(title: string): string | null {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const categoryDirs = ['web', 'crypto', 'forensics', 'reverse', 'misc']
  for (const cat of categoryDirs) {
    const dir = path.join(CHALLENGES_DIR, cat, slug)
    if (fs.existsSync(dir)) return dir
  }
  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ detail: 'Invalid challenge ID' }, { status: 400 })

    const challenge = await prisma.challenge.findUnique({
      where: { id, published: true },
      select: { id: true, title: true, files: true },
    })
    if (!challenge) return NextResponse.json({ detail: 'Challenge not found' }, { status: 404 })
    if (!challenge.files) return NextResponse.json({ detail: 'No files available' }, { status: 404 })

    const fileName = request.nextUrl.searchParams.get('name')
    if (!fileName) return NextResponse.json({ detail: 'File name required' }, { status: 400 })

    const parsed = JSON.parse(challenge.files) as { name: string }[]
    const fileMeta = parsed.find(f => f.name === fileName)
    if (!fileMeta) return NextResponse.json({ detail: 'File not found in challenge' }, { status: 404 })

    const challengeDir = getChallengeDir(challenge.title)
    if (!challengeDir) return NextResponse.json({ detail: 'Challenge directory not found' }, { status: 404 })

    const filePath = path.join(challengeDir, fileName)
    if (!fs.existsSync(filePath)) return NextResponse.json({ detail: 'File not found on disk' }, { status: 404 })

    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(fileName).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.png': 'image/png', '.zip': 'application/zip', '.pcap': 'application/vnd.tcpdump.pcap',
      '.bin': 'application/octet-stream', '.txt': 'text/plain', '.py': 'text/plain',
      '.js': 'text/plain', '.c': 'text/plain', '.json': 'application/json',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch {
    return NextResponse.json({ detail: 'Failed to serve file' }, { status: 500 })
  }
}
