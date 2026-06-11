import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { runScraper, scrapeStatus } from '@/lib/scraper'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }
  return NextResponse.json(scrapeStatus())
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  let category: 'pets' | 'shops' | 'services' | 'all' = 'all'
  try {
    const body = await req.json()
    if (body.category) category = body.category
  } catch { /* default to all */ }

  const result = await runScraper(category)
  return NextResponse.json({ ...result, status: scrapeStatus() })
}
