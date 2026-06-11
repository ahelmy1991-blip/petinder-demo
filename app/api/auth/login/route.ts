import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, signToken } from '@/lib/auth'
import { findUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as Record<string, string>

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const user = findUserByEmail(email.trim().toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  if (user.banned) {
    return NextResponse.json({ error: 'This account has been suspended' }, { status: 403 })
  }

  const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role })

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
