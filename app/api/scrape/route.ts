import { NextRequest, NextResponse } from 'next/server'
import { scrapeAndMerge, getScraperStatus } from '@/lib/scraper'

export async function GET() {
  return NextResponse.json(getScraperStatus())
}

export async function POST(req: NextRequest) {
  const { category = 'restaurant' } = await req.json().catch(() => ({}))
  const result = await scrapeAndMerge(category)
  return NextResponse.json(result)
}
