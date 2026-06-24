import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const pet = db.pets.get(id)
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  const owner = db.users.get(pet.ownerId)
  return NextResponse.json({ pet, owner: owner ? publicUser(owner) : null })
}

// Follow / unfollow a pet
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { id } = await ctx.params
  const pet = db.pets.get(id)
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  const i = pet.followers.indexOf(user.id)
  if (i === -1) pet.followers.push(user.id)
  else pet.followers.splice(i, 1)
  return NextResponse.json({ following: i === -1, followers: pet.followers.length })
}
