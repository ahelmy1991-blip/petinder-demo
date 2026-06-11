import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, notify } from '@/lib/db'

export async function POST(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { postId } = await ctx.params
  const post = db.posts.get(postId)
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  const i = post.likes.indexOf(user.id)
  if (i === -1) {
    post.likes.push(user.id)
    if (post.authorId !== user.id) notify(post.authorId, `${user.name} liked your post ❤️`)
  } else {
    post.likes.splice(i, 1)
  }
  return NextResponse.json({ liked: i === -1, likeCount: post.likes.length })
}
