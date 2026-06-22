'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useStore } from '@/lib/store';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/announcements', label: 'Announcements' },
];

const protectedLinks = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/scoreboard', label: 'Scoreboard' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-void/90 backdrop-blur-xl border-b border-border-c'
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <img src="/images/logo.png" alt="CGS Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <span className="font-display font-bold text-lg text-txt-primary tracking-wide hidden sm:block">
              CyberGuardiansSocietyCTF
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-txt-primary'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-core rounded-full" />
                  )}
                </Link>
              );
            })}
            {isAuthenticated && protectedLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-txt-primary'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-core rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border-c">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-txt-muted hover:text-red-core transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-glow rounded"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border-c">
                <Link
                  href="/login"
                  className="btn-outline px-4 py-1.5 text-xs"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-4 py-1.5 text-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-txt-secondary hover:text-txt-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-glow rounded"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-void border-l border-border-c md:hidden overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-c">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CGS Logo" className="w-7 h-7 object-contain" />
                <span className="font-display font-bold text-sm text-txt-primary tracking-wide">CGS CTF</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-txt-muted hover:text-txt-primary rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-glow"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 py-4 space-y-1">
              {publicLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-txt-primary bg-blue-dim/30 border-l-2 border-blue-core'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && protectedLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-txt-primary bg-blue-dim/30 border-l-2 border-blue-core'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border-c mx-3" />

            <div className="px-4 py-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 rounded-lg bg-surface border border-border-c"
                  >
                    <div className="text-txt-primary font-semibold text-sm">{user?.username}</div>
                    <div className="text-txt-muted text-xs mt-0.5">{user?.score} pts</div>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-red-core hover:bg-red-dim/20 rounded-lg w-full text-sm font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="btn-outline w-full text-center py-2.5 text-xs">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center py-2.5 text-xs">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </nav>
  );
}
