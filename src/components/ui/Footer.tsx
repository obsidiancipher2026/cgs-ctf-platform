'use client';

import Link from 'next/link';
import { Linkedin, MessageCircle, Mail, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-surface border-t border-border-c">
      <div className="dual-beam" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-core" />
              <span className="font-display font-bold text-sm text-txt-primary tracking-wide">CGS CTF</span>
            </div>
            <p className="text-txt-muted text-xs leading-relaxed">
              Empowering the next generation of cybersecurity professionals through competitive CTF challenges.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-body font-semibold text-xs text-txt-secondary uppercase tracking-widest mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {['/', '/about', '/announcements', '/challenges', '/scoreboard'].map((href) => (
                <Link key={href} href={href} className="text-txt-muted text-xs hover:text-blue-glow transition-colors">
                  {href === '/' ? 'Home' : href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </div>
          </div>

          {/* Subscribe */}
          <div>
            <h3 className="font-body font-semibold text-xs text-txt-secondary uppercase tracking-widest mb-4">Stay Updated</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field flex-1 px-3 py-2 text-xs min-w-0"
              />
              <button className="btn-primary px-4 py-2 text-xs whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://www.linkedin.com/in/shayanahmedmughal" target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-blue-glow transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://chat.whatsapp.com/DUvTs6TiEEj2CwTfG7eG9n" target="_blank" rel="noopener noreferrer" className="text-txt-muted hover:text-success transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
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
