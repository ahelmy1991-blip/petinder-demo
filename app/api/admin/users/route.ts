import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized, forbidden } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  if (user.role !== 'admin') return forbidden()
  const users = [...db.users.values()].map(u => ({
    ...publicUser(u),
    providerProfile: db.providerProfiles.get(u.id) ?? null,
    petCount: [...db.pets.values()].filter(p => p.ownerId === u.id).length,
  }))
  return NextResponse.json({ users })
}

/** Admin actions: ban/unban a user, verify a provider. */
export async function PATCH(req: NextRequest) {
  const admin = getSessionUser(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'admin') return forbidden()
  const { userId, action } = await req.json()
  const target = db.users.get(userId)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (target.role === 'admin') return NextResponse.json({ error: 'Cannot act on admins' }, { status: 400 })

  if (action === 'ban') target.banned = true
  else if (action === 'unban') target.banned = false
  else if (action === 'verify') {
    const profile = db.providerProfiles.get(userId)
    if (!profile) return NextResponse.json({ error: 'Not a provider' }, { status: 400 })
    profile.verified = true
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
  return NextResponse.json({ user: publicUser(target) })
}
