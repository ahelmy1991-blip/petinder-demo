import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, signToken } from '@/lib/auth'
import { findUserByEmail, createUser, db, ProviderType } from '@/lib/db'

const PROVIDER_TYPES: ProviderType[] = ['walker', 'sitter', 'vet', 'groomer', 'shop']

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, string>
  const { name, email, password } = body
  const role = body.role === 'provider' ? 'provider' : 'owner'

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

  const user = createUser({ name: name.trim(), email: normalizedEmail, passwordHash: hashPassword(password), role })

  if (role === 'provider') {
    const type = PROVIDER_TYPES.includes(body.providerType as ProviderType)
      ? (body.providerType as ProviderType)
      : 'walker'
    db.providerProfiles.set(user.id, {
      userId: user.id,
      type,
      bio: body.bio?.trim() || `New ${type} on Petinder`,
      city: body.city?.trim() || 'Cairo',
      verified: false,
      rating: 0,
      reviewCount: 0,
      earnings: 0,
    })
  }

  const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role })
  const res = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 },
  )
  res.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
