import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'
import { matchScore } from '@/lib/ai'

/** Match candidates for the viewer's first pet, scored by AI compatibility. */
export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const myPets = [...db.pets.values()].filter(p => p.ownerId === user.id)
  const myPetId = req.nextUrl.searchParams.get('petId')
  const myPet = myPetId ? db.pets.get(myPetId) : myPets[0]
  if (!myPet || myPet.ownerId !== user.id) {
    return NextResponse.json({ candidates: [], myPet: null, needsPet: true })
  }
  const swiped = db.likesGiven.get(user.id) ?? new Set<string>()
  const candidates = [...db.pets.values()]
    .filter(p => p.ownerId !== user.id && !swiped.has(p.id))
    .map(p => {
      const owner = db.users.get(p.ownerId)
      return {
        pet: p,
        owner: owner ? publicUser(owner) : null,
        match: matchScore(myPet, p),
      }
    })
    .sort((a, b) => b.match.score - a.match.score)
  return NextResponse.json({ candidates, myPet, myPets })
}
