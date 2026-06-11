import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db } from '@/lib/db'
import { recommendProducts } from '@/lib/ai'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const category = req.nextUrl.searchParams.get('category')
  const products = [...db.products.values()].filter(p => (category ? p.category === category : true))
  const recommended = recommendProducts(user.id).map(p => p.id)
  return NextResponse.json({ products, recommended })
}
