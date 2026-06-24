import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { generatePetBio, BioInput } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  let body: BioInput = {}
  try {
    body = (await req.json()) as BioInput
  } catch {
    /* empty body → generic bio */
  }

  // Normalise temperament: accept array or comma-separated string
  const raw = (body as { temperament?: unknown }).temperament
  const temperament = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
      ? raw.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const age = typeof body.age === 'number'
    ? body.age
    : body.age !== undefined && body.age !== null && !Number.isNaN(Number(body.age))
      ? Number(body.age)
      : undefined

  const bio = generatePetBio({
    name: body.name,
    species: body.species,
    breed: body.breed,
    age,
    gender: body.gender,
    size: body.size,
    temperament,
    adoptable: Boolean(body.adoptable),
  })

  return NextResponse.json({ bio })
}
