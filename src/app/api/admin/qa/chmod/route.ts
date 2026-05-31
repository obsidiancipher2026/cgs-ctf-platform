import { authenticate, jsonResponse, requireAdmin, getClientIp } from '@/lib/auth'
import { config } from '@/lib/config'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const { user, error } = await authenticate(request)
  if (error) return error
  const clientIp = getClientIp(request)
  const adminCheck = requireAdmin(user, config.admin.allowedIPs, clientIp)
  if (adminCheck) return adminCheck

  try {
    const sitesDir = path.join(process.cwd(), 'challenge-sites')
    const results: any[] = []

    if (!fs.existsSync(sitesDir)) {
      return jsonResponse({ detail: 'challenge-sites directory not found' }, 404)
    }

    const dirs = fs.readdirSync(sitesDir)
    for (const dir of dirs) {
      const fullPath = path.join(sitesDir, dir)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        try {
          const mode = stat.mode
          const isWritable = (mode & 0o222) !== 0

          const items = fs.readdirSync(fullPath)
          const writableFiles: string[] = []
          for (const item of items) {
            const itemPath = path.join(fullPath, item)
            const itemStat = fs.statSync(itemPath)
            if (itemStat.isFile() && (itemStat.mode & 0o222) !== 0) {
              writableFiles.push(item)
            }
          }

          results.push({
            directory: dir,
            world_writable: isWritable,
            writable_files: writableFiles,
            recommendation: isWritable || writableFiles.length > 0
              ? `Mount ${dir} as read-only in production (chmod -R 555)`
              : 'OK',
          })
        } catch {
          results.push({ directory: dir, error: 'Cannot read permissions' })
        }
      }
    }

    return jsonResponse({
      checked_dirs: results.length,
      writable_dirs: results.filter(r => r.world_writable).length,
      details: results,
      recommendation: 'In production, mount challenge-sites/ as a read-only volume (e.g., docker volume with :ro flag)',
    })
  } catch {
    return jsonResponse({ detail: 'Internal server error' }, 500)
  }
}
