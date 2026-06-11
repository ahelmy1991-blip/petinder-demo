import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized, forbidden } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()

  const bookings = [...db.bookings.values()]
  const orders = [...db.orders.values()]
  const completed = bookings.filter(b => b.status === 'completed')
  const bookingGmv = completed.reduce((s, b) => s + b.price, 0)
  const orderGmv = orders.reduce((s, o) => s + o.total, 0)
  const commission =
    completed.reduce((s, b) => s + b.commission, 0) + orders.reduce((s, o) => s + o.commission, 0)

  return NextResponse.json({
    stats: {
      users: db.users.size,
      owners: [...db.users.values()].filter(u => u.role === 'owner').length,
      providers: [...db.users.values()].filter(u => u.role === 'provider').length,
      pets: db.pets.size,
      posts: db.posts.size,
      bookings: bookings.length,
      bookingsByStatus: bookings.reduce<Record<string, number>>((acc, b) => {
        acc[b.status] = (acc[b.status] ?? 0) + 1
        return acc
      }, {}),
      orders: orders.length,
      gmv: bookingGmv + orderGmv,
      platformRevenue: commission,
      matches: db.matches.length,
      messages: db.messages.length,
    },
  })
}
