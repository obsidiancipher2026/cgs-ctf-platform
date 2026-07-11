import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovaSec Labs — Securing Tomorrow, Today.',
  description: 'NovaSec Labs provides enterprise-grade cybersecurity solutions including threat intelligence, penetration testing, and compliance management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
