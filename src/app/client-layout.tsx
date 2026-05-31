'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import CyberBackground from '@/components/3d/CyberBackground';
import { initAuth } from '@/lib/store';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div>
      <div className="scan-line" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 bg-jap-circuit" />
      <CyberBackground />
      <Navbar />
      <main className="relative z-10 pt-16">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#e0e0e0',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#08080d' } },
          error: { iconTheme: { primary: '#ff0033', secondary: '#08080d' } },
        }}
      />
    </div>
  );
}
