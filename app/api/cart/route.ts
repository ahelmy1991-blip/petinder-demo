import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getCart, addToCart } from '@/lib/store'

function getUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  return token ? verifyToken(token) : null
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getCart(user.userId))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { vendorId, vendorNameEn, vendorNameAr, productId, productNameEn, productNameAr, productEmoji, price, quantity = 1 } = body

  if (!vendorId || !productId || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const item = addToCart({ userId: user.userId, vendorId, vendorNameEn, vendorNameAr, productId, productNameEn, productNameAr, productEmoji, price, quantity })
  return NextResponse.json(item, { status: 201 })
}
