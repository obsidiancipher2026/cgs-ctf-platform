import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const enabled = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_mode' } })
  const message = await prisma.securityConfig.findUnique({ where: { key: 'maintenance_message' } })

  return NextResponse.json({
    enabled: enabled?.value === 'true',
    message: message?.value || 'The site is currently under maintenance. Please check back later.',
  })
}
