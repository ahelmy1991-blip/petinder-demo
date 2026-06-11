import { NextRequest, NextResponse } from 'next/server'
import { getAllVendors } from '@/lib/scraper'
import type { Category } from '@/lib/vendors'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category') as Category | null
  const q = searchParams.get('q')

  let list = getAllVendors()

  if (category) list = list.filter(v => v.category === category)
  if (q) {
    const lower = q.toLowerCase()
    list = list.filter(v =>
      v.nameEn.toLowerCase().includes(lower) ||
      v.nameAr.includes(q) ||
      v.districtEn.toLowerCase().includes(lower)
    )
  }

  return NextResponse.json(list)
}
