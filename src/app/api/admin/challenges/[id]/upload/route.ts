import prisma from '@/lib/prisma'
import { authenticate, requireAdmin, jsonResponse, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import { csrfProtection } from '@/lib/csrf'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, error } = await authenticate(request)
  if (error) return error

  const clientIp = getClientIp(request)
  const adminErr = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminErr) return adminErr

  const csrfToken = request.headers.get('x-csrf-token')
  const csrfResult = csrfProtection(`/api/admin/challenges/${params.id}/upload`, 'POST', csrfToken, user.id)
  if (!csrfResult.valid) return jsonResponse({ detail: csrfResult.reason }, 403)

  const challengeId = parseInt(params.id, 10)
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return jsonResponse({ detail: 'Challenge not found' }, 404)

  const formData = await request.formData()
  const files = formData.getAll('file') as File[]
  if (!files || files.length === 0) return jsonResponse({ detail: 'No files provided' }, 400)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'challenges', String(challengeId))
  await mkdir(uploadDir, { recursive: true })

  let mainFileUrl: string | null = null
  const uploaded: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length > 50 * 1024 * 1024) return jsonResponse({ detail: `File ${file.name} exceeds 50MB limit` }, 400)
    const filename = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')
    if (filename.startsWith('..') || filename.startsWith('.')) return jsonResponse({ detail: 'Invalid filename' }, 400)
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/challenges/${challengeId}/${filename}`
    uploaded.push(filename)

    if (filename.endsWith('.html') || filename.endsWith('.htm') || !mainFileUrl) {
      mainFileUrl = fileUrl
    }
  }

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      fileUrl: mainFileUrl || `/uploads/challenges/${challengeId}/${files[0].name}`,
    },
  })

  await prisma.log.create({
    data: {
      action: 'challenge_files_uploaded',
      userId: user.id,
      ipAddress: clientIp,
      severity: 'info',
      details: JSON.stringify({ challengeId, files: uploaded, mainFile: mainFileUrl }),
    },
  })

  return jsonResponse({ message: 'Files uploaded', files: uploaded, main_file_url: mainFileUrl })
}
