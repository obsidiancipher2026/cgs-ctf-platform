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
  { href: '/flag-submit', label: 'Flag Submit' },
  { href: '/scoreboard', label: 'Scoreboard' },
];

function NavLink({ href, label, isActive, onClick }: { href: string; label: string; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 group ${
        isActive ? 'text-txt-primary' : 'text-txt-secondary hover:text-txt-primary'
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-aurora-violet to-aurora-cyan opacity-100'
            : 'bg-transparent group-hover:bg-aurora-cyan/40 opacity-0 group-hover:opacity-100'
        }`}
      />
    </Link>
  );
}

function MobileNavLink({ href, label, isActive, onClick }: { href: string; label: string; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-txt-primary bg-aurora-cyan/20 gradient-border-left'
          : 'text-txt-secondary hover:text-txt-primary hover:bg-surface hover:pl-6'
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

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
      className={`fixed top-0 left-0 right-0 z-50 navbar-glass${scrolled ? ' scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Home">
            <img src="/images/logo.png" alt="CGS Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <span className="font-display font-bold text-lg text-txt-primary tracking-wide hidden sm:block">
              CyberGuardiansSocietyCTF
            </span>
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-1">
            {publicLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={pathname === link.href} />
            ))}
            {isAuthenticated && protectedLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={pathname === link.href} />
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-txt-muted hover:text-aurora-violet transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan rounded"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-outline px-4 py-1.5 text-xs">
                  Login
                </Link>
                <Link href="/register" className="btn-primary px-4 py-1.5 text-xs">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-txt-secondary hover:text-txt-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan rounded"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <motion.div
                animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                className="absolute w-5 h-[2px] bg-current rounded-full"
                style={{ transformOrigin: 'center' }}
              />
              <motion.div
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="absolute w-5 h-[2px] bg-current rounded-full"
              />
              <motion.div
                animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                className="absolute w-5 h-[2px] bg-current rounded-full"
                style={{ transformOrigin: 'center' }}
              />
            </div>
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
            className="fixed top-0 right-0 z-50 max-h-screen w-72 max-w-[85vw] bg-base border-l border-border-c md:hidden flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-c flex-shrink-0">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="CGS Logo" className="w-7 h-7 object-contain" />
                <span className="font-display font-bold text-sm text-txt-primary tracking-wide">CGS CTF</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-txt-muted hover:text-txt-primary rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
              {publicLinks.map((link) => (
                <MobileNavLink key={link.href} href={link.href} label={link.label} isActive={pathname === link.href} onClick={() => setIsOpen(false)} />
              ))}
              {isAuthenticated && protectedLinks.map((link) => (
                <MobileNavLink key={link.href} href={link.href} label={link.label} isActive={pathname === link.href} onClick={() => setIsOpen(false)} />
              ))}
            </div>

            <div className="border-t border-border-c mx-3 flex-shrink-0" />

            <div className="px-4 py-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg bg-surface border border-border-c"
                  >
                    <div className="text-txt-primary font-semibold text-sm">{user?.username}</div>
                    <div className="text-txt-muted text-xs mt-0.5">{user?.score} pts</div>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-aurora-violet hover:bg-aurora-violet/20 rounded-lg w-full text-sm font-medium transition-all"
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
