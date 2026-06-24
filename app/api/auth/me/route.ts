import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const providerProfile = db.providerProfiles.get(user.id) ?? null
  return NextResponse.json({ user: publicUser(user), providerProfile })
}
