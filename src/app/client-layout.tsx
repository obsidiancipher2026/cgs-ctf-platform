'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CyberBackground from '@/components/3d/CyberBackground';
import { initAuth } from '@/lib/store';
import MaintenanceGuard from '@/components/MaintenanceGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <MaintenanceGuard>
      <div className="min-h-screen flex flex-col">
        <div className="scan-line" />
        <CyberBackground />
        <Navbar />
        <main className="relative z-10 flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0B1220',
              color: '#E8F0FF',
              border: '1px solid #1E2D45',
              fontFamily: '"Inter", sans-serif',
              fontSize: '13px',
              borderRadius: '6px',
            },
            success: { iconTheme: { primary: '#00D68F', secondary: '#0B1220' } },
            error: { iconTheme: { primary: '#E02020', secondary: '#0B1220' } },
          }}
        />
      </div>
    </MaintenanceGuard>
  );
}
