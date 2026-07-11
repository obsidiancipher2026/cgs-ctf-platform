'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RefreshCw, Code, Terminal, RotateCcw, X } from 'lucide-react'

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

const DISMISSED_FLAGS_KEY = 'cg-ctf-dismissed-flags'

function getDismissedFlags(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISSED_FLAGS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function dismissFlag(slug: string) {
  const set = getDismissedFlags()
  set.add(slug)
  sessionStorage.setItem(DISMISSED_FLAGS_KEY, JSON.stringify([...set]))
}

export default function WebChallengePlayground({ slug }: Props) {
  const [view, setView] = useState<PlaygroundView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [bodyInput, setBodyInput] = useState('')
  const [extraHeaders, setExtraHeaders] = useState('')
  const [cookiesInput, setCookiesInput] = useState('')
  const [foundFlag, setFoundFlag] = useState<string | null>(null)
  const [flagDismissed, setFlagDismissed] = useState(false)
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
      if (flag && !getDismissedFlags().has(slug)) setFoundFlag(flag)

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
    <div className="h-full flex flex-col">
      {/* Flag banner */}
      {foundFlag && !flagDismissed && (
        <div className="shrink-0 px-4 py-2.5 bg-[rgba(52,232,158,0.1)] border-b border-[rgba(52,232,158,0.2)] flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-[var(--aurora-emerald)] uppercase tracking-wider mb-0.5">Flag Found!</p>
            <p className="text-sm font-mono text-[var(--aurora-emerald)] font-bold break-all">{foundFlag}</p>
          </div>
          <button
            onClick={() => { setFlagDismissed(true); dismissFlag(slug) }}
            className="p-1 rounded hover:bg-white/[0.08] text-[var(--aurora-emerald)]/60 hover:text-[var(--aurora-emerald)] transition-all shrink-0"
            title="Dismiss flag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Request builder */}
      <form onSubmit={handleSubmit} className="shrink-0 px-4 py-2.5 border-b border-white/[0.06] bg-[#070b15]">
        <div className="flex gap-2 items-start">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as 'GET' | 'POST')}
            className="px-2 py-1.5 rounded font-mono text-xs text-[var(--aurora-cyan)] border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.05)] shrink-0 outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <div className="flex-1 min-w-0 flex gap-2">
            <input
              value={bodyInput}
              onChange={e => setBodyInput(e.target.value)}
              placeholder={method === 'GET' ? 'Query params (key=value&...)' : 'Request body'}
              className="flex-1 px-2.5 py-1.5 rounded font-mono text-xs bg-black/30 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none"
            />
            <input
              value={extraHeaders}
              onChange={e => setExtraHeaders(e.target.value)}
              placeholder="Headers (Header: val per line)"
              className="w-52 px-2.5 py-1.5 rounded font-mono text-[10px] bg-black/30 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none"
            />
            <input
              value={cookiesInput}
              onChange={e => setCookiesInput(e.target.value)}
              placeholder="Cookies (key=val; ...)"
              className="w-44 px-2.5 py-1.5 rounded font-mono text-[10px] bg-black/30 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { setShowRaw(!showRaw); setView(null); fetchPlayground('GET', '', '', '') }}
              className={`p-1.5 rounded text-xs transition-all ${showRaw ? 'bg-[rgba(34,211,238,0.15)] text-[var(--aurora-cyan)]' : 'text-txt-muted hover:text-txt-secondary'}`}
              title="Toggle raw/rendered view"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fetchPlayground('GET', '', '', '')}
              className="p-1.5 rounded text-txt-muted hover:text-txt-secondary transition-all"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded bg-[rgba(34,211,238,0.12)] border border-[rgba(34,211,238,0.25)] text-[var(--aurora-cyan)] font-mono text-xs hover:bg-[rgba(34,211,238,0.2)] disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
              Send
            </button>
          </div>
        </div>
      </form>

      {/* Response area */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="p-4 text-xs font-mono text-[#FF5C72]">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-5 h-5 text-[var(--aurora-cyan)] animate-spin" />
          </div>
        )}

        {!loading && view && showRaw && (
          <div className="h-full overflow-auto p-4 font-mono text-xs leading-relaxed">
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
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            className="w-full h-full border-0 bg-white"
            title="Challenge playground"
            sandbox="allow-scripts allow-forms"
          />
        )}

        {!loading && view && !showRaw && !isHtml && !srcdoc && (
          <div className="h-full overflow-auto p-4">
            <pre className="text-xs font-mono text-txt-secondary whitespace-pre-wrap bg-black/20 p-3 rounded">
              {view.body.length > 3000 ? view.body.slice(0, 3000) + '\n...' : view.body}
            </pre>
          </div>
        )}

        {!loading && !view && !error && (
          <div className="flex items-center justify-center h-full text-xs font-mono text-txt-muted">
            Send a request to interact with the challenge.
          </div>
        )}
      </div>
    </div>
  )
}
