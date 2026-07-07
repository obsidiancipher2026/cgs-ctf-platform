'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'

interface Props {
  description: string
  markdown?: string | null
  story?: string | null
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[var(--aurora-cyan)] font-mono text-[0.9em]">
          {match[1].slice(1, -1)}
        </code>
      )
    } else if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-txt-primary">
          {match[2].slice(2, -2)}
        </strong>
      )
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="italic text-txt-secondary">
          {match[3].slice(1, -1)}
        </em>
      )
    } else if (match[4]) {
      parts.push(
        <a
          key={match.index}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--aurora-cyan)] hover:underline underline-offset-2"
        >
          {match[5]}
        </a>
      )
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function renderMarkdown(content: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(
        <div key={blocks.length} className="my-4 rounded-xl overflow-hidden border border-white/[0.06]">
          {lang && (
            <div className="px-4 py-2 bg-white/[0.05] border-b border-white/[0.06] text-[10px] font-mono text-txt-muted uppercase tracking-wider">
              {lang}
            </div>
          )}
          <pre className="p-4 bg-[#080C14] overflow-x-auto">
            <code className="text-sm font-mono text-txt-secondary leading-relaxed">{codeLines.join('\n')}</code>
          </pre>
        </div>
      )
      i++
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      if (tableLines.length >= 2) {
        const rows = tableLines
          .filter(r => !r.match(/^\|[\s-:|]+\|$/))
          .map(r => r.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()))

        blocks.push(
          <div key={blocks.length} className="my-4 overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/[0.08]">
                  {rows[0]?.map((cell, j) => (
                    <th key={j} className="px-4 py-2.5 text-left text-txt-primary font-semibold">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-txt-secondary">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={blocks.length} className="text-2xl font-display font-bold text-txt-primary mt-8 mb-4">
          {line.slice(2)}
        </h1>
      )
      i++
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={blocks.length} className="text-xl font-display font-bold text-txt-primary mt-6 mb-3">
          {line.slice(3)}
        </h2>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={blocks.length} className="text-lg font-display font-semibold text-txt-primary mt-5 mb-2">
          {line.slice(4)}
        </h3>
      )
      i++
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={blocks.length} className="my-3 space-y-1.5 pl-4 list-disc list-outside marker:text-txt-muted">
          {items.map((item, li) => (
            <li key={li} className="text-sm font-mono text-txt-secondary leading-relaxed">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push(
        <ol key={blocks.length} className="my-3 space-y-1.5 pl-4 list-decimal list-outside marker:text-txt-muted">
          {items.map((item, li) => (
            <li key={li} className="text-sm font-mono text-txt-secondary leading-relaxed">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <blockquote key={blocks.length} className="my-4 pl-4 border-l-2 border-[var(--aurora-violet)]/40 text-sm font-mono text-txt-secondary italic leading-relaxed">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="mb-1 last:mb-0">{renderInlineFormatting(ql)}</p>
          ))}
        </blockquote>
      )
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    blocks.push(
      <p key={blocks.length} className="text-sm font-mono text-txt-secondary leading-relaxed mb-3">
        {renderInlineFormatting(line)}
      </p>
    )
    i++
  }

  return blocks
}

export default function ChallengeDescription({ description, markdown, story }: Props) {
  const content = markdown || description

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 sm:p-8"
    >
      {story && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-5 rounded-xl border border-[var(--aurora-violet)]/20 bg-[var(--aurora-violet)]/[0.04] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--aurora-violet)] via-[var(--aurora-cyan)] to-[var(--aurora-emerald)]" />
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[var(--aurora-violet)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--aurora-violet)]">Story</span>
          </div>
          <div className="pl-4 border-l border-white/[0.06]">
            {renderMarkdown(story)}
          </div>
        </motion.div>
      )}

      <div className="prose-dark">
        {renderMarkdown(content)}
      </div>
    </motion.div>
  )
}
