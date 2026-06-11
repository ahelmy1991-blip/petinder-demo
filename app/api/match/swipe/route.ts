import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { myPetId, targetPetId, like } = await req.json()
  const myPet = db.pets.get(myPetId)
  const target = db.pets.get(targetPetId)
  if (!myPet || myPet.ownerId !== user.id) {
    return NextResponse.json({ error: 'Invalid pet' }, { status: 400 })
  }
  if (!target) return NextResponse.json({ error: 'Target pet not found' }, { status: 404 })

  let swiped = db.likesGiven.get(user.id)
  if (!swiped) db.likesGiven.set(user.id, (swiped = new Set()))
  swiped.add(target.id)

  if (!like) return NextResponse.json({ matched: false })

  // Mutual like (the other owner liked one of my pets) → it's a match.
  const otherSwiped = db.likesGiven.get(target.ownerId)
  const mutual = otherSwiped
    ? [...db.pets.values()].some(p => p.ownerId === user.id && otherSwiped.has(p.id))
    : false
  // Adoptable pets always match so adoption conversations can start immediately.
  const matched = mutual || target.adoptable

  if (matched) {
    db.matches.push({
      id: nextId('match'),
      petAId: myPet.id,
      petBId: target.id,
      purpose: target.adoptable ? 'adoption' : 'playdate',
      createdAt: new Date().toISOString(),
    })
    notify(target.ownerId, `🎉 New ${target.adoptable ? 'adoption interest' : 'playdate match'}: ${myPet.name} & ${target.name}!`)
    notify(user.id, `🎉 It's a match! ${myPet.name} & ${target.name}`)
  }
  return NextResponse.json({ matched, otherOwnerId: matched ? target.ownerId : null })
}
