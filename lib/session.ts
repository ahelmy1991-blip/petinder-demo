import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { db, User } from './db'

/** Resolve the authenticated user from the request cookie, or null. */
export function getSessionUser(req: NextRequest): User | null {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = db.users.get(payload.userId)
  if (!user || user.banned) return null
  return user
}

export function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
}
