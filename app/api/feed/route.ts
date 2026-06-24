import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, publicUser, Post } from '@/lib/db'

function enrich(post: Post, viewerId: string) {
  const author = db.users.get(post.authorId)
  const pet = db.pets.get(post.petId)
  return {
    ...post,
    author: author ? publicUser(author) : null,
    pet: pet ?? null,
    likedByMe: post.likes.includes(viewerId),
    likeCount: post.likes.length,
    comments: post.comments.map(c => ({
      ...c,
      author: db.users.get(c.authorId) ? publicUser(db.users.get(c.authorId)!) : null,
    })),
  }
}

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  // Feed ranking (MVP): followed pets first, then recency
  const followedPetIds = new Set(
    [...db.pets.values()].filter(p => p.followers.includes(user.id)).map(p => p.id),
  )
  const posts = [...db.posts.values()]
    .sort((a, b) => {
      const fa = followedPetIds.has(a.petId) ? 1 : 0
      const fb = followedPetIds.has(b.petId) ? 1 : 0
      if (fa !== fb) return fb - fa
      return b.createdAt.localeCompare(a.createdAt)
    })
    .map(p => enrich(p, user.id))
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const body = await req.json()
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
  }
  const pet = db.pets.get(body.petId)
  if (!pet || pet.ownerId !== user.id) {
    return NextResponse.json({ error: 'Select one of your own pets' }, { status: 400 })
  }
  const post: Post = {
    id: nextId('post'),
    authorId: user.id,
    petId: pet.id,
    content: String(body.content).trim().slice(0, 1000),
    photo: pet.photo,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  }
  db.posts.set(post.id, post)
  return NextResponse.json({ post: enrich(post, user.id) }, { status: 201 })
}
