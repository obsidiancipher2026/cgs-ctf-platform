'use client';

import Link from 'next/link';
import { Linkedin, MessageCircle, Mail, Shield } from 'lucide-react';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/scoreboard', label: 'Scoreboard' },
];

const socialLinks = [
  { href: 'https://www.linkedin.com/in/shayanahmedmughal', icon: Linkedin, label: 'LinkedIn', hoverColor: 'hover:text-aurora-cyan' },
  { href: 'https://chat.whatsapp.com/DUvTs6TiEEj2CwTfG7eG9n', icon: MessageCircle, label: 'WhatsApp', hoverColor: 'hover:text-aurora-emerald' },
  { href: 'mailto:cyberguardianssociety@gmail.com', icon: Mail, label: 'Email', hoverColor: 'hover:text-aurora-cyan' },
];

export default function Footer() {
  return (
    <footer className="relative bg-glass border-t border-border-c" style={{ borderColor: 'var(--glass-border-strong)' }}>
      <div className="gradient-divider mb-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand + Social */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-aurora-violet" />
              <span className="font-display font-bold text-sm text-txt-primary tracking-wide">CGS CTF</span>
            </div>
            <p className="text-txt-muted text-xs leading-relaxed mb-5">
              Empowering the next generation of cybersecurity professionals through competitive CTF challenges.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-lg bg-surface border border-border-c text-txt-muted ${s.hoverColor} transition-all duration-200 hover:border-[var(--border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan`}
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-body font-semibold text-xs text-txt-secondary uppercase tracking-widest mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-txt-muted text-xs hover:text-aurora-cyan transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-body font-semibold text-xs text-txt-secondary uppercase tracking-widest mb-4">Stay Updated</h3>
            <p className="text-txt-muted text-[11px] mb-3 leading-relaxed">
              Get the latest alerts, event drops, and platform updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field flex-1 px-3 py-2.5 text-xs min-w-0"
              />
              <button className="btn-primary px-4 py-2.5 text-xs whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border-c mt-8 pt-6 text-center">
          <p className="text-txt-muted text-[10px] font-mono">&copy; 2026 Cyber Guardians Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
