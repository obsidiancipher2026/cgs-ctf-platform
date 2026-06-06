'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swords, Trophy, Flag, ArrowRight, Terminal, Shield, Linkedin, Github, MessageCircle } from 'lucide-react';
import GlitchText from '@/components/ui/GlitchText';

const features = [
  { icon: Shield, title: 'WAF Protection', desc: 'Advanced Web Application Firewall detecting SQLi, XSS, command injection, path traversal, and encoded payloads', color: '#ff4500' },
  { icon: Shield, title: 'Rate Limiting', desc: 'Per-endpoint rate limits with escalating penalties and IP-based quotas for auth, admin, and submission endpoints', color: '#ff0033' },
  { icon: Shield, title: 'Anomaly Detection', desc: 'JSON structure abuse, method enumeration, path probing, parameter pollution, and endpoint hammering detection', color: '#ff6347' },
  { icon: Shield, title: 'Bot Detection', desc: 'Rate analysis, path scraping detection, scanner UA fingerprinting for acunetix, sqlmap, nessus and more', color: '#ff7f50' },
  { icon: Shield, title: 'IP Quarantine & Blacklist', desc: 'Auto-quarantine high-risk IPs with manual block/unblock/whitelist controls', color: '#ff4500' },
  { icon: Shield, title: 'CSRF Protection', desc: 'HMAC-based tokens on all admin mutating endpoints validated server-side', color: '#dc143c' },
  { icon: Shield, title: 'Input Sanitization', desc: 'Strips HTML tags, encodes special chars on all POST/PUT/PATCH body and query params', color: '#ff0033' },
  { icon: Shield, title: 'Account Lockout', desc: 'Progressive delays with CAPTCHA at 3 failures and lockout at 5 failures per IP', color: '#ff6347' },
  { icon: Shield, title: 'Immutable Audit Log', desc: 'SHA256 chain-hash linking every log entry with integrity verification', color: '#ff4500' },
  { icon: Shield, title: 'Fingerprint Anti-Sharing', desc: 'SHA256 device fingerprinting per user detecting multiple fingerprints per account', color: '#dc143c' },
  { icon: Shield, title: 'Body Size Limit', desc: '100 KB limit for requests, 50 MB for file uploads with 413 rejection', color: '#ff0033' },
  { icon: Shield, title: 'CORS Validation', desc: 'Validates Origin/Referer against allowed origins, blocks cross-origin mutating requests', color: '#ff6347' },
];

const categories = [
  { name: 'Cryptography', icon: '🔐', desc: 'Break ciphers and decode secrets', color: '#00ff88' },
  { name: 'Web Exploitation', icon: '🌐', desc: 'Hack web applications and APIs', color: '#00e5ff' },
  { name: 'Reverse Engineering', icon: '⚙️', desc: 'Decompile and analyze binaries', color: '#b300ff' },
  { name: 'Forensics', icon: '🔍', desc: 'Investigate digital evidence', color: '#ffd700' },
  { name: 'Miscellaneous', icon: '🎲', desc: 'Mixed challenges of all types', color: '#ff0033' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 cyber-grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-cyan/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 text-[200px] font-black text-cyber-cyan/5 pointer-events-none select-none leading-none hidden sm:block">
          技
        </div>
        <div className="absolute bottom-20 left-10 text-[160px] font-black text-cyber-red/5 pointer-events-none select-none leading-none hidden sm:block">
          電
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 mb-4">
              <Terminal className="w-4 h-4 text-cyber-cyan" />
              <span className="text-cyber-cyan text-xs tracking-widest uppercase">
                Season 2026 • Registration Open
              </span>
            </div>

            <GlitchText
              text="Cyber Guardians Society"
              className="text-3xl sm:text-4xl md:text-7xl font-cyber font-black text-white mb-2 tracking-tight"
            />

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-4xl font-cyber font-bold bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-red bg-clip-text text-transparent mb-6"
            >
              Capture The Flag Competition
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
            >
              Test your cybersecurity skills against the best. Solve challenges, capture flags, climb the leaderboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/challenges"
                className="cyber-btn group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/50 text-white text-sm font-semibold hover:from-cyber-cyan/30 hover:to-cyber-purple/30 transition-all"
              >
                View Challenges
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/scoreboard"
                className="cyber-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-cyber-cyan/20 text-cyber-cyan text-sm font-semibold hover:bg-cyber-cyan/10 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 border-t border-cyber-cyan/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-lg sm:text-xl font-cyber font-bold text-white mb-6 tracking-widest uppercase">
              Sponsored By
            </h2>
            <div className="flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                <img src="/images/tryhackme-logo.svg" alt="TryHackMe" className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain" />
                <span className="text-5xl sm:text-6xl md:text-7xl font-cyber font-bold text-white tracking-tight">TryHackMe</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl sm:text-3xl font-cyber font-bold text-white text-center mb-10 sm:mb-14"
          >
            Features
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="cyber-card rounded-xl p-6 group transition-all"
                  style={{ borderTopColor: feat.color, borderTopWidth: 2 }}
                >
                  <Icon className="w-8 h-8 mb-4" style={{ color: feat.color }} />
                  <h3 className="font-cyber font-bold text-white text-lg mb-2">{feat.title}</h3>
                  <p className="text-gray-400 text-sm">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-cyber-dark/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl sm:text-3xl font-cyber font-bold text-white text-center mb-10 sm:mb-14"
          >
            Categories
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="cyber-card rounded-xl p-6 text-center group cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-cyber font-bold text-white text-sm mb-1">{cat.name}</h3>
                <p className="text-gray-500 text-xs">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-cyber-cyan/10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="text-center sm:text-left">
              <h3 className="font-cyber font-bold text-sm text-white mb-3">Cyber Guardians Society</h3>
              <p className="text-gray-500 font-mono text-xs leading-relaxed">Empowering the next generation of cybersecurity professionals through competitive CTF challenges.</p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-cyber font-bold text-sm text-white mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Home</Link>
                <Link href="/about" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">About</Link>
                <Link href="/announcements" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Announcements</Link>
                <Link href="/challenges" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Challenges</Link>
                <Link href="/scoreboard" className="text-gray-500 font-mono text-xs hover:text-cyber-cyan transition-colors">Scoreboard</Link>
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
  );
}
