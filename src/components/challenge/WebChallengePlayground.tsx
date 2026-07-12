'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, Code2, Eye, Send, ChevronDown, Flag, AlertTriangle } from 'lucide-react'

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

function statusLabel(status: number): string {
  if (status === 200) return 'OK'
  if (status === 301 || status === 302) return 'Redirect'
  if (status === 400) return 'Bad Request'
  if (status === 401) return 'Unauthorized'
  if (status === 403) return 'Forbidden'
  if (status === 404) return 'Not Found'
  if (status === 500) return 'Server Error'
  return 'Error'
}

export default function WebChallengePlayground({ slug }: Props) {
  const [view, setView] = useState<PlaygroundView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [path, setPath] = useState('/')
  const [bodyInput, setBodyInput] = useState('')
  const [extraHeaders, setExtraHeaders] = useState('')
  const [cookiesInput, setCookiesInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [foundFlag, setFoundFlag] = useState<string | null>(null)
  const [flagDismissed, setFlagDismissed] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fetchPlayground = useCallback(async (opts?: {
    m?: 'GET' | 'POST'; p?: string; b?: string; h?: string; c?: string
  }) => {
    setLoading(true)
    setError(null)
    const meth = opts?.m || method
    const p = opts?.p ?? path
    const b = opts?.b ?? bodyInput
    const h = opts?.h ?? extraHeaders
    const c = opts?.c ?? cookiesInput

    try {
      const reqHeaders: Record<string, string> = {
        'Accept': 'text/html,application/json,*/*',
      }
      if (h) {
        h.split('\n').filter(Boolean).forEach(line => {
          const idx = line.indexOf(':')
          if (idx > 0) reqHeaders[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
        })
      }
      if (c) reqHeaders['x-playground-cookie'] = c

      const sub = p && p !== '/' ? p : ''
      const query = meth === 'GET' && b ? '?' + b : ''
      const res = await fetch(`/api/playground/${slug}${sub}${query}`, {
        method: meth,
        headers: reqHeaders,
        body: meth === 'POST' ? (b || bodyInput) : undefined,
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
  }, [slug, method, path, bodyInput, extraHeaders, cookiesInput])

  useEffect(() => {
    fetchPlayground()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlayground({ m: method, p: path, b: bodyInput, h: extraHeaders, c: cookiesInput })
  }

  const srcdoc = view?.body?.startsWith('<!')
    ? view.body.replace('<head>', `<head><base href="/standalone/${slug}/">`)
    : undefined
  const isHtml = view?.headers?.['content-type']?.includes('text/html') || !!srcdoc || false

  return (
    <div className="h-full flex flex-col bg-[#05080f]">
      {/* Flag banner */}
      {foundFlag && !flagDismissed && (
        <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-[rgba(52,232,158,0.12)] to-[rgba(34,211,238,0.08)] border-b border-[rgba(52,232,158,0.25)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Flag className="w-4 h-4 text-[var(--aurora-emerald)] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-mono text-[var(--aurora-emerald)] uppercase tracking-wider mb-0.5">Flag Captured</p>
              <p className="text-sm font-mono text-[var(--aurora-emerald)] font-bold break-all">{foundFlag}</p>
            </div>
          </div>
          <button
            onClick={() => { setFlagDismissed(true); dismissFlag(slug) }}
            className="px-2 py-1 rounded text-[10px] font-mono text-[var(--aurora-emerald)]/60 hover:text-[var(--aurora-emerald)] hover:bg-white/[0.06] transition-all shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Request builder */}
      <form onSubmit={handleSubmit} className="shrink-0 px-4 py-3 border-b border-white/[0.06] bg-[#070b15] space-y-2">
        <div className="flex gap-2 items-center">
          <select
            value={method}
            onChange={e => setMethod(e.target.value as 'GET' | 'POST')}
            className="px-2.5 py-2 rounded-md font-mono text-xs font-bold text-[var(--aurora-cyan)] border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.06)] outline-none cursor-pointer"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <div className="flex-1 min-w-0 flex items-center rounded-md border border-white/[0.08] bg-black/40 focus-within:border-[rgba(34,211,238,0.35)] transition-colors">
            <span className="pl-3 pr-1 font-mono text-[10px] text-txt-muted select-none">/api/playground/{slug}</span>
            <input
              value={path}
              onChange={e => setPath(e.target.value.startsWith('/') ? e.target.value : '/' + e.target.value)}
              className="flex-1 px-0 py-2 bg-transparent font-mono text-xs text-txt-primary outline-none min-w-0"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[rgba(34,211,238,0.14)] border border-[rgba(34,211,238,0.3)] text-[var(--aurora-cyan)] font-mono text-xs font-semibold hover:bg-[rgba(34,211,238,0.22)] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-[10px] font-mono text-txt-muted hover:text-txt-secondary transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            {method === 'GET' ? 'Query / Headers / Cookies' : 'Body / Headers / Cookies'}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => { setShowRaw(!showRaw); fetchPlayground() }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${showRaw ? 'bg-[rgba(34,211,238,0.15)] text-[var(--aurora-cyan)]' : 'text-txt-muted hover:text-txt-secondary'}`}
          >
            {showRaw ? <Eye className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
            {showRaw ? 'Rendered' : 'Raw'}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
            <textarea
              value={bodyInput}
              onChange={e => setBodyInput(e.target.value)}
              placeholder={method === 'GET' ? 'Query: key=value&foo=bar' : 'Body: key=value&foo=bar'}
              rows={3}
              className="px-2.5 py-2 rounded-md font-mono text-[11px] bg-black/40 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none resize-none"
            />
            <textarea
              value={extraHeaders}
              onChange={e => setExtraHeaders(e.target.value)}
              placeholder={'Headers (one per line):\nX-Custom: value'}
              rows={3}
              className="px-2.5 py-2 rounded-md font-mono text-[11px] bg-black/40 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none resize-none"
            />
            <textarea
              value={cookiesInput}
              onChange={e => setCookiesInput(e.target.value)}
              placeholder={'Cookies:\nrole=admin; session=valid'}
              rows={3}
              className="px-2.5 py-2 rounded-md font-mono text-[11px] bg-black/40 border border-white/[0.08] text-txt-primary placeholder:text-txt-muted outline-none resize-none"
            />
          </div>
        )}
      </form>

      {/* Response area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-4 text-xs font-mono text-[#FF5C72] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[var(--aurora-cyan)] animate-spin" />
          </div>
        )}

        {!loading && view && (
          <>
            {/* Status bar */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 border-b border-white/[0.05] bg-black/20">
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                view.status < 300 ? 'text-[var(--aurora-emerald)] bg-[rgba(52,232,158,0.1)]' :
                view.status < 400 ? 'text-[var(--aurora-cyan)] bg-[rgba(34,211,238,0.1)]' :
                view.status < 500 ? 'text-[#FFB454] bg-[rgba(255,180,84,0.1)]' :
                'text-[#FF5C72] bg-[rgba(255,92,114,0.1)]'
              }`}>
                {view.status} {statusLabel(view.status)}
              </span>
              <span className="font-mono text-[10px] text-txt-muted">
                {view.body.length} bytes
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {showRaw ? (
                <div className="p-4 font-mono text-xs leading-relaxed">
                  <div className="text-txt-muted mb-2">HTTP/1.1 {view.status} {statusLabel(view.status)}</div>
                  <div className="text-txt-muted mb-2">
                    {Object.entries(view.headers).map(([k, v]) => (
                      <div key={k}><span className="text-[var(--aurora-cyan)]">{k}</span>: {v}</div>
                    ))}
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 mt-2 whitespace-pre-wrap break-all">
                    {view.body.length > 4000 ? view.body.slice(0, 4000) + '\n... (truncated)' : view.body}
                  </div>
                </div>
              ) : isHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={srcdoc}
                  className="w-full h-full border-0 bg-white"
                  title="Challenge response"
                  sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                />
              ) : (
                <pre className="p-4 text-xs font-mono text-txt-secondary whitespace-pre-wrap break-all bg-black/20">
                  {view.body.length > 4000 ? view.body.slice(0, 4000) + '\n... (truncated)' : view.body}
                </pre>
              )}
            </div>
          </>
        )}

        {!loading && !view && !error && (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-txt-muted">
            Send a request to interact with the challenge.
          </div>
        )}
      </div>
    </div>
  )
}
