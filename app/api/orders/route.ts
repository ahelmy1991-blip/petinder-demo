import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify, Order, COMMISSION_RATES } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const orders = [...db.orders.values()]
    .filter(o => o.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return NextResponse.json({ orders })
}

/** Checkout: converts the cart into an order, decrements stock, pays vendors. */
export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const cartItems = [...db.cart.values()].filter(c => c.userId === user.id)
  if (!cartItems.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  const items: Order['items'] = []
  for (const c of cartItems) {
    const product = db.products.get(c.productId)
    if (!product) return NextResponse.json({ error: 'A product in your cart no longer exists' }, { status: 409 })
    if (product.stock < c.quantity) {
      return NextResponse.json({ error: `Only ${product.stock} left of ${product.name}` }, { status: 409 })
    }
    items.push({ productId: product.id, name: product.name, price: product.price, quantity: c.quantity })
  }

  // Commit: decrement stock, credit vendors, clear cart
  let total = 0
  let commission = 0
  for (const c of cartItems) {
    const product = db.products.get(c.productId)!
    product.stock -= c.quantity
    const line = product.price * c.quantity
    const cut = Math.round(line * COMMISSION_RATES.shop)
    total += line
    commission += cut
    const vendor = db.users.get(product.vendorId)
    const profile = db.providerProfiles.get(product.vendorId)
    if (vendor) vendor.walletBalance += line - cut
    if (profile) profile.earnings += line - cut
    notify(product.vendorId, `🛒 New order: ${c.quantity}× ${product.name}`)
    db.cart.delete(c.id)
  }

  const order: Order = {
    id: nextId('ord'),
    userId: user.id,
    items,
    total,
    commission,
    status: 'placed',
    createdAt: new Date().toISOString(),
  }
  db.orders.set(order.id, order)
  notify(user.id, `✅ Order ${order.id} placed — total ${total} EGP`)
  return NextResponse.json({ order }, { status: 201 })
}
