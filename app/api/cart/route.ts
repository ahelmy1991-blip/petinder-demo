import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId } from '@/lib/db'

function cartFor(userId: string) {
  const items = [...db.cart.values()]
    .filter(c => c.userId === userId)
    .map(c => ({ ...c, product: db.products.get(c.productId) ?? null }))
  const total = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0)
  return { items, total }
}

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  return NextResponse.json(cartFor(user.id))
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { productId, quantity = 1 } = await req.json()
  const product = db.products.get(productId)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.stock < 1) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })

  const existing = [...db.cart.values()].find(c => c.userId === user.id && c.productId === productId)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + Number(quantity), product.stock)
  } else {
    const item = { id: nextId('crt'), userId: user.id, productId, quantity: Math.min(Number(quantity) || 1, product.stock) }
    db.cart.set(item.id, item)
  }
  return NextResponse.json(cartFor(user.id), { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { itemId, quantity } = await req.json()
  const item = db.cart.get(itemId)
  if (!item || item.userId !== user.id) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  if (quantity <= 0) db.cart.delete(itemId)
  else item.quantity = Number(quantity)
  return NextResponse.json(cartFor(user.id))
}
