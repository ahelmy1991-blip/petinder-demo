import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params
  const user = db.users.get(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Public user object — strip sensitive fields
  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }

  // Provider profile (only for providers)
  const providerProfile =
    user.role === 'provider'
      ? (() => {
          const p = db.providerProfiles.get(userId)
          if (!p) return undefined
          const { type, bio, city, verified, rating, reviewCount } = p
          return { type, bio, city, verified, rating, reviewCount }
        })()
      : undefined

  // Pets — only for owners
  const pets =
    user.role === 'owner'
      ? [...db.pets.values()].filter(p => p.ownerId === userId)
      : undefined

  // Posts — last 10 posts authored by this user
  const allUserPosts = [...db.posts.values()]
    .filter(p => p.authorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(p => ({ ...p, authorName: user.name }))

  // Services — only for providers
  const services =
    user.role === 'provider'
      ? [...db.services.values()].filter(s => s.providerId === userId)
      : undefined

  // Reviews targeting this user
  const reviews = db.reviews
    .filter(r => r.targetUserId === userId)
    .map(r => {
      const author = db.users.get(r.authorId)
      return {
        id: r.id,
        authorId: r.authorId,
        authorName: author?.name ?? 'Unknown',
        authorAvatar: author?.avatar ?? '',
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      }
    })

  // Stats
  const userPets = [...db.pets.values()].filter(p => p.ownerId === userId)
  const followerCount = userPets.reduce((sum, p) => sum + p.followers.length, 0)
  const stats = {
    petCount: userPets.length,
    postCount: [...db.posts.values()].filter(p => p.authorId === userId).length,
    followerCount,
    reviewCount: reviews.length,
  }

  return NextResponse.json({
    user: publicUser,
    ...(providerProfile !== undefined && { providerProfile }),
    ...(pets !== undefined && { pets }),
    posts: allUserPosts,
    ...(services !== undefined && { services }),
    reviews,
    stats,
  })
}
