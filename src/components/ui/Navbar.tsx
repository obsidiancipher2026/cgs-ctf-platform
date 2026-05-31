'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Swords, Trophy, Flag, LogOut, User, Home, Info, Bell } from 'lucide-react';
import { useStore } from '@/lib/store';

const publicLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/announcements', label: 'Announcements', icon: Bell },
];

const protectedLinks = [
  { href: '/challenges', label: 'Challenges', icon: Swords },
  { href: '/scoreboard', label: 'Scoreboard', icon: Trophy },
  { href: '/flag-submit', label: 'Flag Submit', icon: Flag },
];

const sidebarVariants = {
  closed: { x: '100%', opacity: 0 },
  open: { x: 0, opacity: 1 },
};

const backdropVariants = {
  closed: { opacity: 0, pointerEvents: 'none' as const },
  open: { opacity: 1, pointerEvents: 'auto' as const },
};

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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cyber-black/90 backdrop-blur-lg border-b border-cyber-blue/20' : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group" aria-label="Home">
            <span className="font-cyber font-bold text-base sm:text-lg text-white neon-pulse">
              CyberGuardiansSocietyCTF
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30'
                      : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {isAuthenticated && protectedLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30'
                      : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-cyber-cyan/20">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/10 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-cyber-red transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-cyber-cyan/20">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-sm text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/10 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg text-sm bg-cyber-red/20 text-cyber-red border border-cyber-red/50 hover:bg-cyber-red/30 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-cyber-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 rounded-lg"
            onClick={toggleMenu}
            onKeyDown={handleKeyDown}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-sidebar"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="mobile-sidebar"
            key="sidebar-panel"
            className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-cyber-black/95 backdrop-blur-xl border-l border-cyber-cyan/20 md:hidden overflow-y-auto"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-cyan/10">
              <span className="font-cyber font-bold text-sm text-white">
                Menu
              </span>
              <button
                onClick={closeMenu}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-cyber-cyan/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-1">
              {publicLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30'
                        : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && protectedLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30'
                        : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-cyber-cyan/10 mt-2 px-4 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/10">
                    <div className="text-cyber-green font-bold text-sm">@{user?.username}</div>
                    <div className="text-gray-500 text-xs mt-1">{user?.score} pts</div>
                  </div>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="flex items-center gap-3 px-4 py-3 text-cyber-red hover:bg-cyber-red/10 rounded-lg w-full text-sm transition-all"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full px-4 py-3 text-center rounded-lg text-cyber-cyan border border-cyber-cyan/30 text-sm hover:bg-cyber-cyan/10 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="w-full px-4 py-3 text-center rounded-lg bg-cyber-red/20 text-cyber-red text-sm hover:bg-cyber-red/30 transition-all"
                  >
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
