import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, MatchMode, publicUser } from '@/lib/db'
import { matchScore } from '@/lib/ai'

const MODES: MatchMode[] = ['walk', 'adoption', 'breed']

/** Match candidates for the viewer's pet, filtered & scored by match mode. */
export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  const myPets = [...db.pets.values()].filter(p => p.ownerId === user.id)
  const myPetId = req.nextUrl.searchParams.get('petId')
  const myPet = myPetId ? db.pets.get(myPetId) : myPets[0]
  if (!myPet || myPet.ownerId !== user.id) {
    return NextResponse.json({ candidates: [], myPet: null, myPets, needsPet: true })
  }

  const modeParam = req.nextUrl.searchParams.get('mode') as MatchMode | null
  const mode: MatchMode = modeParam && MODES.includes(modeParam) ? modeParam : 'walk'

  const swiped = db.likesGiven.get(user.id) ?? new Set<string>()

  const candidates = [...db.pets.values()]
    .filter(p => p.ownerId !== user.id && !swiped.has(p.id))
    .filter(p => {
      if (mode === 'adoption') return p.adoptable
      if (mode === 'breed') {
        // Breeding: same species, opposite sex, not up for adoption
        return p.species === myPet.species && p.gender !== myPet.gender && !p.adoptable
      }
      // walk: playdates with any non-adoption pet (adoptable pets focus on adoption flow)
      return !p.adoptable
    })
    .map(p => {
      const owner = db.users.get(p.ownerId)
      return {
        pet: p,
        owner: owner ? publicUser(owner) : null,
        match: matchScore(myPet, p, mode),
      }
    })
    .filter(c => c.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score)

  return NextResponse.json({ candidates, myPet, myPets, mode })
}
