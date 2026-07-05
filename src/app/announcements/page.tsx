'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, ChevronLeft, ChevronRight, Clock, Calendar, ArrowUpRight, Radio, Siren } from 'lucide-react';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function linkify(text: string) {
  const pattern = /(https?:\/\/[^\s<]+|\/[a-zA-Z0-9_\-./?&=]+)/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (part.match(/^https?:\/\//)) {
      const href = part.replace(/[<>"'`]/g, '');
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
          className="text-blue-glow underline decoration-blue-core/30 hover:decoration-blue-core transition-all inline-flex items-center gap-1 font-medium break-all"
        >
          {escapeHtml(part)} <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    }
    if (part.startsWith('/')) {
      const href = part.replace(/[<>"'`]/g, '');
      return <a key={i} href={href} className="text-blue-glow underline decoration-blue-core/30 hover:decoration-blue-core transition-all font-medium">{escapeHtml(part)}</a>;
    }
    return escapeHtml(part);
  });
}

function renderMessage(text: string) {
  return text.split(/\n\n+/).map((p, i) => {
    const trimmed = p.trim();
    return trimmed ? <p key={i} className="mb-4 last:mb-0 leading-relaxed">{linkify(trimmed)}</p> : null;
  });
}

const PER_PAGE = 5;

function extractPreview(msg: string, maxLen = 120): string {
  const plain = msg.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    import('@/lib/api').then(({ api }) => api.getAnnouncements().then(setAnnouncements).catch(() => {}).finally(() => setLoading(false)));
  }, []);

  const totalPages = Math.max(1, Math.ceil(announcements.length / PER_PAGE));
  const clampedPage = Math.min(page, totalPages - 1);
  const paged = useMemo(() => {
    const start = clampedPage * PER_PAGE;
    return announcements.slice(start, start + PER_PAGE);
  }, [announcements, clampedPage]);

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeModal]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero - SOC Mission Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="pulse-dot" />
            <span className="eyebrow text-[10px]">Live Feed</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-txt-primary">Mission Updates</h1>
          <p className="text-txt-secondary text-sm sm:text-base max-w-2xl mt-4">
            Real-time intelligence from Cyber Guardians Society. Track platform changes, event alerts, and critical bulletins.
          </p>
        </motion.div>

        <div className="gradient-divider" />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-core animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border-c flex items-center justify-center mx-auto mb-5">
              <Radio className="w-7 h-7 text-txt-muted" />
            </div>
            <p className="text-txt-secondary text-sm font-medium">No transmissions yet</p>
            <p className="text-txt-muted text-xs mt-2">Check back when the next broadcast drops.</p>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {paged.map((a: any, i: number) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(a)}
                  className="w-full text-left card card-lift px-5 py-4 group cursor-pointer gradient-border-left hover:border-[var(--border-accent)] hover:shadow-[0_0_24px_rgba(26,110,255,0.1)] transition-all duration-300"
                >
                  <div className="pl-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-body font-semibold text-txt-primary text-sm sm:text-base truncate group-hover:text-blue-glow transition-colors">{a.title}</h2>
                      <span className="text-[10px] font-mono text-txt-muted whitespace-nowrap">{formatDate(a.created_at)}</span>
                    </div>
                    <p className="text-txt-muted text-xs leading-relaxed line-clamp-2">{extractPreview(a.message)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-mono text-txt-muted">
                        <Clock className="w-3 h-3" /> {formatTime(a.created_at)}
                      </span>
                      <span className="text-[10px] font-mono text-blue-core/60 group-hover:text-blue-core transition-colors ml-auto">Read full &rarr;</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => setPage(Math.max(0, clampedPage - 1))} disabled={clampedPage === 0} className="p-2 text-txt-muted hover:text-blue-core disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-txt-muted">{clampedPage + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))} disabled={clampedPage >= totalPages - 1} className="p-2 text-txt-muted hover:text-blue-core disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border border-border-c rounded-lg p-6 sm:p-8"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-txt-muted hover:text-txt-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <span className="pulse-dot" />
                <h2 className="font-display font-bold text-lg sm:text-xl text-txt-primary">{selected.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-border-c">
                <span className="flex items-center gap-1.5 text-xs font-mono text-txt-muted">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(selected.created_at)}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-txt-muted">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(selected.created_at)}
                </span>
              </div>
              <div className="text-txt-secondary text-sm leading-relaxed break-words">{renderMessage(selected.message)}</div>
              <div className="mt-6 pt-4 border-t border-border-c">
                <button onClick={closeModal} className="btn-outline px-4 py-2 text-xs">Back to Feed</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
