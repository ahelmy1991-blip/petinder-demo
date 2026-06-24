import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const targetUserId = req.nextUrl.searchParams.get('targetUserId')
  const reviews = db.reviews
    .filter(r => (targetUserId ? r.targetUserId === targetUserId : true))
    .map(r => ({ ...r, author: db.users.get(r.authorId)?.name ?? 'Unknown' }))
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { targetUserId, rating, text } = await req.json()
  const target = db.users.get(targetUserId)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
  }
  // Only allow reviewing providers you actually completed a booking with
  const hasCompleted = [...db.bookings.values()].some(
    b => b.ownerId === user.id && b.providerId === targetUserId && b.status === 'completed',
  )
  if (!hasCompleted) {
    return NextResponse.json({ error: 'You can only review providers after a completed booking' }, { status: 403 })
  }
  const review = {
    id: nextId('rev'),
    targetUserId,
    authorId: user.id,
    rating: r,
    text: String(text ?? '').trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
  }
  db.reviews.push(review)

  // Recompute provider rating
  const profile = db.providerProfiles.get(targetUserId)
  if (profile) {
    const theirs = db.reviews.filter(x => x.targetUserId === targetUserId)
    profile.rating = Math.round((theirs.reduce((s, x) => s + x.rating, 0) / theirs.length) * 10) / 10
    profile.reviewCount = theirs.length
  }
  notify(targetUserId, `⭐ ${user.name} left you a ${r}-star review`)
  return NextResponse.json({ review }, { status: 201 })
}
