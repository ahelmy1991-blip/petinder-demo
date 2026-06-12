import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  // Collect IDs of all pets owned by the current user
  const myPetIds = new Set(
    [...db.pets.values()].filter(p => p.ownerId === user.id).map(p => p.id),
  )

  // Filter matches where the current user owns at least one of the pets
  const enriched = db.matches
    .filter(m => myPetIds.has(m.petAId) || myPetIds.has(m.petBId))
    .map(m => {
      const isMineA = myPetIds.has(m.petAId)
      const myPetId = isMineA ? m.petAId : m.petBId
      const theirPetId = isMineA ? m.petBId : m.petAId

      const myPet = db.pets.get(myPetId) ?? null
      const theirPet = db.pets.get(theirPetId) ?? null
      const theirOwner = theirPet
        ? (() => {
            const o = db.users.get(theirPet.ownerId)
            if (!o) return null
            return { id: o.id, name: o.name, avatar: o.avatar }
          })()
        : null

      return {
        id: m.id,
        purpose: m.purpose,
        createdAt: m.createdAt,
        myPet,
        theirPet,
        theirOwner,
      }
    })

  return NextResponse.json({ matches: enriched, count: enriched.length })
}
