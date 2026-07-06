'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Lock, Eye, AlertTriangle, FileCheck, Network, Key, Database, Search, Fingerprint } from 'lucide-react';

type Particle = { x: number; y: number; vx: number; vy: number };

const NUM_PARTICLES = 120;
const MAX_DISTANCE = 100;

function NetworkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
    }));

    const draw = () => {
      ctx!.fillStyle = 'rgb(5, 5, 15)';
      ctx!.fillRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < MAX_DISTANCE) {
            const alpha = Math.max(40, 255 - d * 2) / 255;
            ctx!.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.fillStyle = 'rgb(0, 255, 255)';
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

const features = [
  { icon: Shield, title: 'WAF Protection', desc: 'Advanced Web Application Firewall detecting SQLi, XSS, command injection, and encoded payloads', side: 'red' as const },
  { icon: Zap, title: 'Rate Limiting', desc: 'Per-endpoint rate limits with escalating penalties and IP-based quotas', side: 'blue' as const },
  { icon: Lock, title: 'Brute-Force Lockout', desc: 'Progressive tarpit delays with exponential backoff on failed login attempts', side: 'red' as const },
  { icon: Key, title: 'HMAC Tokens', desc: 'CSRF protection via HMAC-based tokens on all admin mutating endpoints', side: 'blue' as const },
];

const categories = [
  { name: 'Cryptography', icon: '🔐', desc: 'Break codes and hidden messages', slug: 'crypto' },
  { name: 'Web Exploitation', icon: '🌐', desc: 'Find weaknesses in websites', slug: 'web' },
  { name: 'Reverse Engineering', icon: '⚙️', desc: 'Take apart programs and understand them', slug: 'reverse' },
  { name: 'Forensics', icon: '🔎', desc: 'Investigate digital evidence', slug: 'forensics' },
  { name: 'Miscellaneous', icon: '🎲', desc: 'Anything and everything unexpected', slug: 'misc' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="absolute inset-0 opacity-15 pointer-events-none"><NetworkParticles /></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aurora-violet/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-aurora-cyan/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Season Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border-c bg-surface mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-aurora-violet animate-blink" />
              <span className="text-txt-secondary text-xs font-mono uppercase tracking-widest">Season 2026 &middot; Registration Open</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl text-txt-primary mb-4 tracking-wide">
              CYBER GUARDIANS SOCIETY
            </h1>

            {/* Sub-headline */}
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl mb-6" style={{ background: 'linear-gradient(90deg, #7C5CFF, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Capture. Exploit. Defend.
            </h2>

            {/* Body */}
            <p className="text-txt-secondary text-base sm:text-lg max-w-2xl mx-auto mb-10">
              Test your skills against the sharpest minds in cybersecurity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/challenges" className="btn-primary px-8 py-4 text-sm inline-flex items-center justify-center gap-2">
                View Challenges <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/scoreboard" className="btn-outline px-8 py-4 text-sm inline-flex items-center justify-center gap-2">
                Leaderboard
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-5 h-8 border-2 border-border-c rounded-full flex justify-center pt-1.5">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1 bg-aurora-cyan rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dual-beam divider */}
      <div className="aurora-divider" />

      {/* Security Features */}
      <section className="py-16 sm:py-20 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
            <span className="text-txt-muted text-xs font-mono uppercase tracking-[0.2em]">Platform Security</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Built to Resist</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card card-lift p-6 border-l-2 ${feat.side === 'red' ? 'border-l-aurora-violet' : 'border-l-aurora-cyan'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feat.side === 'red' ? 'bg-aurora-violet/20' : 'bg-aurora-cyan/20'}`}>
                    <Icon className={`w-5 h-5 ${feat.side === 'red' ? 'text-aurora-violet' : 'text-aurora-cyan'}`} />
                  </div>
                  <h3 className="font-body font-semibold text-txt-primary text-sm mb-1">{feat.title}</h3>
                  <p className="text-txt-secondary text-xs leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary">What Will You Break?</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/challenges?category=${cat.slug}`}
                  className="card card-lift glitch-hover block p-6 text-center group"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-body font-semibold text-txt-primary text-sm mb-1 group-hover:text-aurora-violet transition-colors">{cat.name}</h3>
                  <p className="text-txt-muted text-xs">{cat.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 bg-surface border-t border-border-c">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mb-4">Ready to prove yourself?</h2>
            <p className="text-txt-secondary text-sm mb-8">Register now and start your journey. Every expert was once a beginner.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary px-8 py-3 text-sm inline-flex items-center justify-center gap-2">
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about" className="btn-outline px-8 py-3 text-sm inline-flex items-center justify-center">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
