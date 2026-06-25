import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovaSec Labs — Securing Tomorrow, Today',
  description: 'NovaSec Labs | Next-Generation Cybersecurity Solutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
