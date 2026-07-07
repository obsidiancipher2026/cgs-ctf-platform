'use client';

import Link from 'next/link';
import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Target, Swords, Rocket, Flag, Trophy, Eye, Lock, CheckCircle, AlertTriangle, Terminal, Palette, Radio, Calendar, Users } from 'lucide-react';

const pillars = [
  { icon: Shield, title: 'Who We Are', content: 'Cyber Guardians Society is for people who love solving problems and finding hidden things. We welcome everyone — no matter your background. Our goal is simple: teach you to think like a hacker through real challenges.', accent: 'red' as const },
  { icon: Target, title: 'What We Do', content: 'We believe the best way to learn cybersecurity is by actually doing it. Our platform gives you real practice, not just theory. Train through real hacking simulations and build skills you can actually use.', accent: 'blue' as const },
  { icon: Swords, title: 'How to Play', content: 'Each challenge hides a secret called a flag. Find it and you prove you solved the challenge. It won\'t be easy — you have to look carefully and think outside the box. Every flag you find moves you forward.', accent: 'red' as const },
  { icon: Rocket, title: 'Begin Your Journey', content: 'Start small, learn the basics, and slowly take on harder challenges. If you get stuck, hints are there to help — but try on your own first. Some challenges test your knowledge. Some test how much you don\'t give up.', accent: 'blue' as const },
];

const rules = [
  { icon: Shield, title: 'Fair Play', desc: 'Only use the provided platform. Do not attack the infrastructure, other users\' accounts, or attempt to bypass security.', color: 'text-purple-400' },
  { icon: CheckCircle, title: 'Account Rules', desc: 'One account per person. Multiple accounts will be banned. Keep your credentials secure and do not share access.', color: 'text-aurora-cyan' },
  { icon: AlertTriangle, title: 'Respect', desc: 'Be respectful to all community members. Harassment, hate speech, or toxic behavior results in immediate removal.', color: 'text-orange-400' },
];

const founderData = {
  name: 'Shayan Ahmed',
  role: 'Founder / Director',
  desc: 'Vision & Leadership',
  img: '/images/shayan-ahmed.jpeg',
  department: 'Command',
  experience: '5+ years',
  specialization: 'Cybersecurity Strategy',
};

const deputyData = {
  name: 'Muhammad Saad',
  role: 'Deputy Lead',
  desc: 'Coordination & Execution',
  img: '/images/muhammad-saad.jpeg',
  department: 'Operations',
  experience: '4+ years',
  specialization: 'Team Management',
};

const leadsData = [
  { name: 'Muhammad Taha', role: 'Technical Lead', desc: 'Cybersecurity & CTFs', img: '/images/muhammad-taha.jpeg', department: 'Engineering', experience: '4+ years', specialization: 'Penetration Testing', glow: 'blue', icon: Terminal },
  { name: 'Esha Javed', role: 'Graphics Lead', desc: 'Design & Branding', img: '/images/esha-javed.jpeg', department: 'Creative', experience: '3+ years', specialization: 'UI/UX Design', glow: 'purple', icon: Palette },
  { name: 'Jannat Fatima', role: 'Media Lead', desc: 'Social Media & Announcements', img: '/images/jannat-fatima.jpg', department: 'Communications', experience: '3+ years', specialization: 'Content Strategy', glow: 'cyan', icon: Radio },
  { name: 'Asad Malik', role: 'Event Lead', desc: 'Event Planning & Execution', img: '/images/asad-malik.jpeg', department: 'Operations', experience: '3+ years', specialization: 'Event Management', glow: 'orange', icon: Calendar },
  { name: 'Bisma Noor', role: 'Community Lead', desc: 'Engagement & Collaborations', img: '/images/bisma-noor.jpeg', department: 'Community', experience: '2+ years', specialization: 'Community Building', glow: 'blue-red', icon: Users },
];

function stagger(i: number, base = 0.06) {
  return { delay: i * base };
}

/* ─── Network Particles Canvas ─── */
function NetworkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(124,92,255, 0.15)';
        ctx!.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(124,92,255, ${0.06 * (1 - dist / 140)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
}

/* ─── Section wrapper with mouse parallax ─── */
function useMouseParallax(ref: React.RefObject<HTMLDivElement | null>) {
  const handleMouse = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.setProperty('--parallax-x', String(x));
    ref.current.style.setProperty('--parallax-y', String(y));
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouse);
    return () => el.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);
}

export default function About() {
  const networkRef = useRef<HTMLDivElement>(null);
  useMouseParallax(networkRef);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section 1: Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="eyebrow">About Us</span>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-txt-primary mt-3">Who We Are</h1>
          <p className="text-txt-secondary text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Cyber Guardians Society is a community-driven cybersecurity platform built for students, by students. We believe the best way to learn security is through hands-on practice — solving real challenges, finding hidden flags, and growing together.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="chip chip-violet">Founded 2024</span>
            <span className="chip chip-cyan">Community First</span>
          </div>
        </motion.div>

        <div className="gradient-divider" />

        {/* Section 2: Four Pillars */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="eyebrow">What We Stand For</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Our Core Pillars</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={stagger(i, 0.08)}
              className={`card card-lift p-5 gradient-border-left`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${p.accent === 'red' ? 'bg-aurora-violet/10' : 'bg-aurora-cyan/10'}`}>
                  <p.icon className={`w-5 h-5 ${p.accent === 'red' ? 'text-aurora-violet' : 'text-aurora-cyan'}`} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-txt-primary text-lg mb-1">{p.title}</h2>
                  <p className="text-txt-secondary text-sm leading-relaxed">{p.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="gradient-divider" />

        {/* Section 3: Rules */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="eyebrow">Guidelines</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-2">Platform Rules</h2>
          <p className="text-txt-secondary text-sm max-w-xl mx-auto mt-3">
            Follow these rules to keep the competition fair and enjoyable for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={stagger(i, 0.06)}
              className="card card-lift p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] text-txt-muted font-bold w-5 h-5 flex items-center justify-center rounded-full bg-surface border border-border-c flex-shrink-0">{i + 1}</span>
                <rule.icon className={`w-4 h-4 ${rule.color} flex-shrink-0`} />
                <h3 className="font-display font-bold text-txt-primary text-sm">{rule.title}</h3>
              </div>
              <p className="text-txt-secondary text-xs leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="gradient-divider" />

        {/* Section 4: Command Network */}
        <div ref={networkRef} className="command-network-section mb-16">
          {/* Network Canvas Background */}
          <NetworkParticles />

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="command-header mb-12"
          >
            <span className="eyebrow">Command Structure</span>
            <h2 className="text-3xl sm:text-5xl mt-3 mb-3">Meet The Command Structure</h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto">
              The minds behind Cyber Guardians Society.
            </p>
          </motion.div>

          {/* Hierarchy Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="command-grid"
          >
            {/* ─── FOUNDER ─── */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="founder-wrapper"
            >
              <div className="founder-glow" />
              <div className="founder-ring" />
              <div className="founder-ring-slow" />
              <div className="founder-card">
                <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                  <span className="founder-status">Online</span>
                </div>
                <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                  <div className="relative">
                    <img src={founderData.img} alt={founderData.name} className="founder-avatar" />
                  </div>
                  <div>
                    <h3 className="founder-name text-xl sm:text-2xl">{founderData.name}</h3>
                    <div className="flex justify-center mt-1.5 mb-1">
                      <span className="founder-badge">Founder / Director</span>
                    </div>
                    <p className="founder-desc">{founderData.desc}</p>
                  </div>
                </div>
                {/* Bio overlay on hover */}
                <div className="founder-bio-overlay hidden sm:block">
                  <div className="flex flex-wrap gap-2 justify-center text-[11px]">
                    <span className="chip chip-violet">Dept: {founderData.department}</span>
                    <span className="chip chip-cyan">Exp: {founderData.experience}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── ENERGY BEAM ─── */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="energy-beam"
              style={{ transformOrigin: 'top' }}
            >
              <div className="energy-pulse" />
              <div className="energy-pulse-2" />
            </motion.div>

            {/* ─── DEPUTY ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="deputy-card">
                <span className="deputy-role mb-2">Deputy Lead</span>
                <div className="flex flex-col items-center gap-2">
                  <img src={deputyData.img} alt={deputyData.name} className="deputy-avatar" />
                  <div>
                    <h3 className="founder-name text-base sm:text-lg">{deputyData.name}</h3>
                    <p className="founder-desc text-center mt-0.5">{deputyData.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── BRANCH CONNECTOR ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="branch-connector hidden md:block"
            >
              <div className="branch-pulse" />
            </motion.div>

            {/* ─── LEADERSHIP NODES ─── */}
            <div className="leadership-row">
              {leadsData.map((lead, i) => (
                <motion.div
                  key={lead.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  className={`lead-node lead-glow-${lead.glow}`}
                >
                  <div className="lead-card">
                    <lead.icon className="w-3.5 h-3.5 mb-1 text-txt-muted" />
                    <img src={lead.img} alt={lead.name} className="lead-avatar" />
                    <h3 className="lead-name mt-1.5">{lead.name}</h3>
                    <span className="lead-role-label mt-1">{lead.role}</span>
                    <p className="text-txt-muted text-[10px] mt-1 leading-tight">{lead.desc}</p>
                    {/* Stats overlay on hover */}
                    <div className="lead-stats hidden sm:block">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        <span className="text-[10px] font-mono text-txt-muted">{lead.department}</span>
                        <span className="text-[10px] font-mono text-txt-muted">&middot;</span>
                        <span className="text-[10px] font-mono text-txt-muted">{lead.experience}</span>
                      </div>
                      <p className="text-[10px] font-mono text-txt-secondary mt-1">{lead.specialization}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="gradient-divider" />

        {/* Section 5: CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center py-6">
          <div className="max-w-xl mx-auto">
            <span className="eyebrow">Join the Mission</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-txt-primary mt-3">Ready to join the fight?</h2>
            <p className="text-txt-secondary text-sm mt-3 mb-8 leading-relaxed">
              Register now and start your journey. Every expert was once a beginner.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary px-6 py-3 text-sm inline-flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/scoreboard" className="btn-outline px-6 py-3 text-sm inline-flex items-center justify-center">
                View Leaderboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
