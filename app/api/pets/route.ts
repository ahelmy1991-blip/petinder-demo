import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, Pet } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const mine = req.nextUrl.searchParams.get('mine') === '1'
  const pets = [...db.pets.values()].filter(p => (mine ? p.ownerId === user.id : true))
  return NextResponse.json({ pets })
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const body = await req.json()
  if (!body.name?.trim() || !body.breed?.trim()) {
    return NextResponse.json({ error: 'Name and breed are required' }, { status: 400 })
  }
  const age = Number(body.age)
  if (!Number.isFinite(age) || age < 0 || age > 50) {
    return NextResponse.json({ error: 'Age must be a number between 0 and 50' }, { status: 400 })
  }
  const pet: Pet = {
    id: nextId('pet'),
    ownerId: user.id,
    name: String(body.name).trim(),
    species: ['dog', 'cat', 'bird', 'other'].includes(body.species) ? body.species : 'other',
    breed: String(body.breed).trim(),
    age,
    gender: body.gender === 'female' ? 'female' : 'male',
    size: ['small', 'medium', 'large'].includes(body.size) ? body.size : 'medium',
    temperament: Array.isArray(body.temperament)
      ? body.temperament.map(String).slice(0, 6)
      : String(body.temperament ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 6),
    medical: String(body.medical ?? '').trim(),
    bio: String(body.bio ?? '').trim(),
    photo: String(body.photo || '🐾'),
    adoptable: Boolean(body.adoptable),
    followers: [],
  }
  db.pets.set(pet.id, pet)
  return NextResponse.json({ pet }, { status: 201 })
}
