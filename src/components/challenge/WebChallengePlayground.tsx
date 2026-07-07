'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw, Code, Terminal, RotateCcw } from 'lucide-react'

interface Props {
  slug: string
  title: string
}

interface PlaygroundView {
  status: number
  headers: Record<string, string>
  body: string
  flag?: string
}

export default function WebChallengePlayground({ slug, title }: Props) {
  const [view, setView] = useState<PlaygroundView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [bodyInput, setBodyInput] = useState('')
  const [extraHeaders, setExtraHeaders] = useState('')
  const [cookiesInput, setCookiesInput] = useState('')
  const [foundFlag, setFoundFlag] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fetchPlayground = useCallback(async (m?: string, b?: string, h?: string, c?: string) => {
    setLoading(true)
    setError(null)
    const meth = m || method
    try {
      const reqHeaders: Record<string, string> = {
        'Accept': 'text/html,application/json,*/*',
      }
      if (h) {
        h.split('\n').filter(Boolean).forEach(line => {
          const [k, ...v] = line.split(':')
          if (k && v.length) reqHeaders[k.trim()] = v.join(':').trim()
        })
      }
      if (c) reqHeaders['cookie'] = c

      const res = await fetch(`/api/playground/${slug}${meth === 'GET' && b ? '?' + b : ''}`, {
        method: meth,
        headers: reqHeaders,
        body: meth === 'POST' ? b || bodyInput : undefined,
      })

      const flag = res.headers.get('x-challenge-flag') || undefined
      if (flag) setFoundFlag(flag)

      const text = await res.text()
      const respHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => {
        if (!k.startsWith('x-')) respHeaders[k] = v
      })

      setView({
        status: res.status,
        headers: respHeaders,
        body: text,
        flag,
      })
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }, [slug, method, bodyInput])

  useEffect(() => {
    fetchPlayground('GET', '', '', '')
  }, [slug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new URLSearchParams()
    if (bodyInput) {
      bodyInput.split('&').filter(Boolean).forEach(pair => {
        const [k, v] = pair.split('=')
        if (k) formData.append(k.trim(), v || '')
      })
    }
    fetchPlayground(method, formData.toString(), extraHeaders, cookiesInput)
  }

  const srcdoc = view?.body?.startsWith('<!') ? view.body : undefined
  const isHtml = view?.headers?.['content-type']?.includes('text/html') || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden"
    >
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aurora-cyan)]" />
            <span className="font-display text-sm text-txt-primary">{title} — Playground</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-all ${showRaw ? 'bg-[rgba(34,211,238,0.15)] text-[var(--aurora-cyan)]' : 'text-txt-muted hover:text-txt-secondary hover:bg-white/[0.06]'}`}
              title="Toggle raw response"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fetchPlayground('GET', '', '', '')}
              className="p-1.5 rounded-lg text-txt-muted hover:text-txt-secondary hover:bg-white/[0.06] transition-all"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {foundFlag && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(52,232,158,0.12)] border border-[rgba(52,232,158,0.25)]">
            <p className="text-[10px] font-mono text-[var(--aurora-emerald)] uppercase tracking-wider mb-1">Flag Found!</p>
            <p className="text-sm font-mono text-[var(--aurora-emerald)] font-bold break-all">{foundFlag}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 mb-4">
          <div className="flex gap-2 items-start">
            <select
              value={method}
              onChange={e => setMethod(e.target.value as 'GET' | 'POST')}
              className="input-field px-2.5 py-2 rounded-lg font-mono text-xs text-[var(--aurora-cyan)] border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.05)] shrink-0"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <div className="flex-1 min-w-0">
              <input
                value={bodyInput}
                onChange={e => setBodyInput(e.target.value)}
                placeholder={method === 'GET' ? 'Query params (key=value&...)' : 'Request body'}
                className="input-field w-full px-3 py-2 rounded-lg font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[rgba(34,211,238,0.12)] border border-[rgba(34,211,238,0.25)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
              Send
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={extraHeaders}
              onChange={e => setExtraHeaders(e.target.value)}
              placeholder="Custom headers (Header: value per line)"
              className="input-field flex-1 px-3 py-1.5 rounded-lg font-mono text-[10px]"
            />
            <input
              value={cookiesInput}
              onChange={e => setCookiesInput(e.target.value)}
              placeholder="Cookies (key=value; ...)"
              className="input-field flex-1 px-3 py-1.5 rounded-lg font-mono text-[10px]"
            />
          </div>
        </form>
      </div>

      <div className="border-t border-white/[0.06]">
        {error && (
          <div className="p-4 text-xs font-mono text-[#FF5C72]">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-5 h-5 text-[var(--aurora-cyan)] animate-spin" />
          </div>
        )}

        {!loading && view && showRaw && (
          <div className="p-4 font-mono text-xs leading-relaxed">
            <div className="text-txt-muted mb-2">
              HTTP/1.1 {view.status} <span className="text-txt-secondary">{view.status === 200 ? 'OK' : view.status === 302 ? 'Found' : view.status === 404 ? 'Not Found' : 'Error'}</span>
            </div>
            <div className="text-txt-muted mb-2">
              {Object.entries(view.headers).map(([k, v]) => (
                <div key={k}><span className="text-[var(--aurora-cyan)]">{k}</span>: {v}</div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-2 mt-2">
              {view.body.length > 2000 ? view.body.slice(0, 2000) + '...' : view.body}
            </div>
          </div>
        )}

        {!loading && view && !showRaw && (isHtml || srcdoc) && (
          <div className="bg-white rounded-b-2xl" style={{ minHeight: 300 }}>
            <iframe
              ref={iframeRef}
              srcDoc={srcdoc}
              className="w-full border-0 rounded-b-2xl"
              style={{ minHeight: 300, height: Math.max(300, Math.min(800, (view.body.match(/<[^>]+>/g) || []).length * 10)) }}
              title="Challenge playground"
              sandbox="allow-scripts allow-forms"
            />
          </div>
        )}

        {!loading && view && !showRaw && !isHtml && !srcdoc && (
          <div className="p-4">
            <pre className="text-xs font-mono text-txt-secondary whitespace-pre-wrap bg-black/20 p-3 rounded-lg">
              {view.body.length > 3000 ? view.body.slice(0, 3000) + '\n...' : view.body}
            </pre>
          </div>
        )}

        {!loading && !view && !error && (
          <div className="p-10 text-center text-xs font-mono text-txt-muted">
            Send a request to interact with the challenge.
          </div>
        )}
      </div>
    </motion.div>
  )
}
