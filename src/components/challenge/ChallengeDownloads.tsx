'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileCode, FileText, FileArchive, File, ExternalLink } from 'lucide-react'

interface ChallengeFile {
  name: string
  size?: string | number
  url?: string
}

interface Props {
  slug: string
  downloads?: string | null
  files?: string | null
  challengeId?: number
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'zip': case 'tar': case 'gz': case 'rar': case '7z':
      return FileArchive
    case 'py': case 'js': case 'ts': case 'java': case 'c': case 'cpp': case 'go': case 'rs':
      return FileCode
    case 'txt': case 'md': case 'log': case 'csv':
      return FileText
    default:
      return File
  }
}

function getFileColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'zip': case 'tar': case 'gz': case 'rar': case '7z':
      return 'text-signal-amber'
    case 'py': case 'js': case 'ts': case 'java': case 'c': case 'cpp': case 'go': case 'rs':
      return 'text-[var(--aurora-cyan)]'
    case 'pcap': case 'pcapng':
      return 'text-[var(--aurora-emerald)]'
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'bmp':
      return 'text-pink-400'
    default:
      return 'text-txt-muted'
  }
}

function parseFiles(downloadsJson: string | null | undefined, filesJson: string | null | undefined): ChallengeFile[] {
  if (downloadsJson) {
    try {
      const parsed = JSON.parse(downloadsJson)
      if (Array.isArray(parsed)) {
        return parsed.map((f: any) => ({
          name: f.name || f.filename || String(f),
          size: f.size,
          url: f.url,
        }))
      }
    } catch {}
  }

  if (filesJson) {
    try {
      const parsed = JSON.parse(filesJson)
      if (Array.isArray(parsed)) {
        return parsed.map((f: any) => ({
          name: typeof f === 'string' ? f : f.name || f.filename || String(f),
          size: f.size,
          url: f.url,
        }))
      }
    } catch {}
  }

  return []
}

export default function ChallengeDownloads({ slug, downloads, files, challengeId }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const fileList = parseFiles(downloads, files)

  if (fileList.length === 0) return null

  const handleDownload = async (file: ChallengeFile) => {
    setDownloading(file.name)
    const url = file.url || `/api/challenges/${challengeId}/files?name=${encodeURIComponent(file.name)}`
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    setTimeout(() => setDownloading(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5"
    >
      <h3 className="font-display text-sm text-txt-primary mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-emerald)]" />
        Downloads
        <span className="text-[10px] font-mono text-txt-muted bg-white/[0.05] px-2 py-0.5 rounded-full">
          {fileList.length} file{fileList.length !== 1 ? 's' : ''}
        </span>
      </h3>

      <div className="space-y-2">
        {fileList.map((file, i) => {
          const Icon = getFileIcon(file.name)
          const color = getFileColor(file.name)
          const isDownloading = downloading === file.name

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ x: 4 }}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer"
              onClick={() => handleDownload(file)}
            >
              <div className={`p-2 rounded-lg bg-white/[0.05] ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-txt-primary truncate">{file.name}</div>
                {file.size && (
                  <div className="text-[10px] font-mono text-txt-muted mt-0.5">{String(file.size)}</div>
                )}
              </div>
              <motion.div
                animate={isDownloading ? { scale: [1, 1.2, 1] } : {}}
                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'text-[var(--aurora-emerald)]' : 'text-[var(--aurora-cyan)]'}`} />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => {
            fileList.forEach(file => {
              const url = file.url || `/api/challenges/${challengeId}/files?name=${encodeURIComponent(file.name)}`
              const link = document.createElement('a')
              link.href = url
              link.download = file.name
              link.click()
            })
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-txt-secondary hover:bg-white/[0.08] hover:text-txt-primary hover:border-white/[0.12] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download All
        </button>
      </div>
    </motion.div>
  )
}
