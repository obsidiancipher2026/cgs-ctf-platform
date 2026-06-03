'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Calendar, Megaphone, Loader2, ArrowUpRight,
  X, ChevronLeft, ChevronRight, Clock, Tag, ExternalLink,
  Linkedin, Github, MessageCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { sanitizeInput } from '@/lib/sanitize';

function linkify(text: string) {
  const pattern = /(https?:\/\/[^\s<]+|\/[a-zA-Z0-9_\-./?&=]+)/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (part.match(/^https?:\/\//)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-cyber-blue underline decoration-cyber-blue/30 hover:decoration-cyber-blue hover:text-blue-300 transition-all inline-flex items-center gap-1 font-medium break-all"
        >
          {part}
          <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    }
    if (part.startsWith('/')) {
      return (
        <a key={i} href={part}
          className="text-cyber-blue underline decoration-cyber-blue/30 hover:decoration-cyber-blue hover:text-blue-300 transition-all font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function renderMessage(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    const trimmed = p.trim();
    if (!trimmed) return null;
    return (
      <p key={i} className="mb-4 last:mb-0 leading-relaxed">{linkify(trimmed)}</p>
    );
  });
}

const PER_PAGE = 5;

function extractPreview(msg: string, maxLen = 120): string {
  const plain = msg.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(announcements.length / PER_PAGE));
  const clampedPage = Math.min(page, totalPages - 1);

  const paged = useMemo(() => {
    const start = clampedPage * PER_PAGE;
    return announcements.slice(start, start + PER_PAGE);
  }, [announcements, clampedPage]);

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeModal]);

  return (
    <div>
      {/* Main page */}
      <div className="min-h-screen py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-blue/30 bg-cyber-blue/5 mb-6">
              <Megaphone className="w-4 h-4 text-cyber-blue" />
              <span className="text-cyber-blue font-mono text-xs tracking-widest uppercase">Latest News</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-cyber font-black text-white mb-4">
              News & Updates
            </h1>
            <p className="text-gray-400 font-mono text-sm sm:text-base max-w-2xl mx-auto">
              Stay informed with the latest announcements, event updates, and platform changes.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-cyber-blue animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-mono text-sm sm:text-base">No announcements yet. Check back later!</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {paged.map((a: any, i: number) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(a)}
                    className="w-full text-left cyber-card rounded-xl px-5 py-4 border border-gray-800/60 hover:border-cyber-blue/30 hover:shadow-[0_0_15px_rgba(0,150,255,0.08)] transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-5 h-5 text-cyber-blue" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="font-cyber text-white text-sm sm:text-base truncate group-hover:text-cyber-blue transition-colors">
                            {a.title}
                          </h2>
                          <span className="text-[10px] font-mono text-gray-600 whitespace-nowrap flex-shrink-0">
                            {formatDate(a.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-500 font-mono text-xs leading-relaxed line-clamp-2 break-words">
                          {extractPreview(a.message)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
                            <Clock className="w-3 h-3" />
                            {formatTime(a.created_at)}
                          </span>
                          <span className="text-[10px] font-mono text-cyber-blue/60 group-hover:text-cyber-blue transition-colors ml-auto">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage(Math.max(0, clampedPage - 1))}
                    disabled={clampedPage === 0}
                    className="p-2 rounded-lg text-gray-500 hover:text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs text-gray-500">
                    {clampedPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, clampedPage + 1))}
                    disabled={clampedPage >= totalPages - 1}
                    className="p-2 rounded-lg text-gray-500 hover:text-cyber-blue hover:bg-cyber-blue/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-cyber-cyan/10 pt-8 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Cyber Guardians Society</h3>
                <p className="text-gray-500 font-mono text-xs leading-relaxed">Empowering the next generation of cybersecurity professionals through competitive CTF challenges.</p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Quick Links</h3>
                <div className="flex flex-col gap-2">
                  <a href="/" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Home</a>
                  <a href="/about" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">About</a>
                  <a href="/announcements" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Announcements</a>
                  <a href="/challenges" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Challenges</a>
                  <a href="/scoreboard" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Scoreboard</a>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-cyber font-bold text-sm text-white mb-3">Subscribe to Updates</h3>
                <div className="flex gap-2">
                  <input type="email" placeholder="your@email.com" className="cyber-input flex-1 px-3 py-2 rounded-lg font-mono text-xs min-w-0" />
                  <button className="px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-mono text-xs hover:bg-cyber-cyan/30 transition-all whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                  <a href="https://www.linkedin.com/in/shayanahmedmughal" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-cyan transition-colors"><Linkedin className="w-5 h-5" /></a>
                  <a href="https://chat.whatsapp.com/DUvTs6TiEEj2CwTfG7eG9n" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-green transition-colors"><MessageCircle className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
            <div className="border-t border-cyber-cyan/5 pt-4 text-center">
              <p className="text-gray-600 font-mono text-[10px]">&copy; 2026 Cyber Guardians Society. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto cyber-card rounded-2xl p-6 sm:p-8 border border-cyber-blue/20 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal header */}
              <div className="flex items-start gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-cyber-blue" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h2 className="font-cyber text-white text-lg sm:text-xl pr-8 break-words">
                    {selected.title}
                  </h2>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mt-4 mb-5 pb-4 border-b border-gray-800/50">
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-cyber-blue/60" />
                  {formatDate(selected.created_at)}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-cyber-blue/60" />
                  {formatTime(selected.created_at)}
                </span>
              </div>

              {/* Modal body */}
              <div className="text-gray-300 font-mono text-sm leading-relaxed break-words overflow-hidden">
                {renderMessage(selected.message)}
              </div>

              {/* Bottom close */}
              <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between items-center">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs hover:bg-cyber-blue/20 transition-all"
                >
                  Back to Announcements
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
