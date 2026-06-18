import { NextRequest, NextResponse } from 'next/server'
import { conversationExists, db, MatchMode, nextId, notify, sendMessage } from '@/lib/db'
import { getSessionUser, unauthorized } from '@/lib/session'

const MODES: MatchMode[] = ['walk', 'adoption', 'breed']

const MODE_LABEL: Record<MatchMode, string> = {
  walk: 'fun walk',
  adoption: 'adoption',
  breed: 'breeding',
}

/** First message Petinder posts on the matcher's behalf to kick off the chat. */
function introMessage(mode: MatchMode, myPetName: string, theirPetName: string): string {
  switch (mode) {
    case 'adoption':
      return `Hi! 🏡 I saw ${theirPetName} on Petinder and I'd love to learn more about adopting. Is ${theirPetName} still looking for a home?`
    case 'breed':
      return `Hi! 💞 ${myPetName} and ${theirPetName} came up as a breeding match on Petinder. Would you be open to discussing a litter?`
    default:
      return `Hi! 🐾 ${myPetName} matched with ${theirPetName} for a fun walk. Want to set up a playdate at a park nearby?`
  }
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  const { myPetId, targetPetId, like, mode: modeRaw } = await req.json()
  const mode: MatchMode = MODES.includes(modeRaw) ? modeRaw : 'walk'

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

  // Mutual like (the other owner already liked one of my pets) → it's a match.
  const otherSwiped = db.likesGiven.get(target.ownerId)
  const mutual = otherSwiped
    ? [...db.pets.values()].some(p => p.ownerId === user.id && otherSwiped.has(p.id))
    : false

  // Demo/seed accounts (and adoptable pets) accept instantly so the journey is
  // testable end-to-end. Real users still require a mutual like.
  const targetOwner = db.users.get(target.ownerId)
  const isDemoCounterpart = targetOwner?.email.endsWith('@petinder.app') ?? false
  const matched = mutual || mode === 'adoption' || target.adoptable || isDemoCounterpart

  if (!matched) return NextResponse.json({ matched: false })

  // Avoid duplicate match records / re-seeding the intro for the same pet pair.
  const alreadyMatched = db.matches.some(
    m =>
      (m.petAId === myPet.id && m.petBId === target.id) ||
      (m.petAId === target.id && m.petBId === myPet.id),
  )

  if (!alreadyMatched) {
    db.matches.push({
      id: nextId('match'),
      petAId: myPet.id,
      petBId: target.id,
      purpose: mode,
      createdAt: new Date().toISOString(),
    })

    // Initiate the conversation in the Petinder database so both profiles can chat.
    if (!conversationExists(user.id, target.ownerId)) {
      sendMessage(user.id, target.ownerId, introMessage(mode, myPet.name, target.name))
    }

    notify(target.ownerId, `🎉 New ${MODE_LABEL[mode]} match: ${myPet.name} & ${target.name}! Check your chats 💬`)
    notify(user.id, `🎉 It's a ${MODE_LABEL[mode]} match! ${myPet.name} & ${target.name} — say hi 💬`)
  }

  return NextResponse.json({
    matched: true,
    mode,
    otherOwnerId: target.ownerId,
    targetPetName: target.name,
  })
}
