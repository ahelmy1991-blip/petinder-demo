import { NextRequest, NextResponse } from 'next/server'
import { getTrends } from '@/lib/trends'
import { getSessionUser, unauthorized } from '@/lib/session'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  return NextResponse.json(getTrends())
}
