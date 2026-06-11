import { NextRequest, NextResponse } from 'next/server'
import { getAllVendors } from '@/lib/scraper'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vendor = getAllVendors().find(v => v.id === id)
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(vendor)
}
