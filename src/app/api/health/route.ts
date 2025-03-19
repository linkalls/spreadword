// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.BUN_ENV ?? "",
    uptime: process.uptime()
  }

  return NextResponse.json(healthInfo, { status: 200 })
}