import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized, forbidden } from '@/lib/session'
import { db, notify, BookingStatus } from '@/lib/db'

const PROVIDER_TRANSITIONS: Record<string, BookingStatus[]> = {
  pending: ['accepted', 'rejected'],
  accepted: ['completed'],
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const booking = db.bookings.get(id)
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  const { status } = (await req.json()) as { status: BookingStatus }

  // Owner can cancel a pending booking; provider drives the rest.
  if (status === 'cancelled') {
    if (booking.ownerId !== user.id) return forbidden()
    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending bookings can be cancelled' }, { status: 400 })
    }
  } else {
    if (booking.providerId !== user.id) return forbidden()
    const allowed = PROVIDER_TRANSITIONS[booking.status] ?? []
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `Cannot move ${booking.status} → ${status}` }, { status: 400 })
    }
  }

  booking.status = status

  if (status === 'completed') {
    // Pay out provider (price minus commission) into wallet/earnings
    const profile = db.providerProfiles.get(booking.providerId)
    const provider = db.users.get(booking.providerId)
    const payout = booking.price - booking.commission
    if (profile) profile.earnings += payout
    if (provider) provider.walletBalance += payout
    notify(booking.ownerId, `✅ Your booking is complete. How was it? Leave a review!`)
  } else if (status === 'accepted') {
    notify(booking.ownerId, `👍 Your booking was accepted`)
  } else if (status === 'rejected') {
    notify(booking.ownerId, `😔 Your booking was declined`)
  } else if (status === 'cancelled') {
    notify(booking.providerId, `Booking ${booking.id} was cancelled by the owner`)
  }

  return NextResponse.json({ booking })
}
