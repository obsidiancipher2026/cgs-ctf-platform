import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Cyber Guardians Society CTF',
  description: 'Cyber Guardians Society - Capture The Flag Competition Platform',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base font-body">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
