import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, signToken } from '@/lib/auth'
import { findUserByEmail, createUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, email, password } = (await req.json()) as Record<string, string>

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (findUserByEmail(normalizedEmail)) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const user = createUser({ name: name.trim(), email: normalizedEmail, passwordHash: hashPassword(password) })
  const token = signToken({ userId: user.id, email: user.email, name: user.name })

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
