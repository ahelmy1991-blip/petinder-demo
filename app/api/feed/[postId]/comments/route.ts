import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify } from '@/lib/db'

export async function POST(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { postId } = await ctx.params
  const post = db.posts.get(postId)
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
  const comment = {
    id: nextId('cmt'),
    authorId: user.id,
    text: String(text).trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  }
  post.comments.push(comment)
  if (post.authorId !== user.id) notify(post.authorId, `${user.name} commented on your post 💬`)
  return NextResponse.json({ comment: { ...comment, author: { id: user.id, name: user.name, avatar: user.avatar } } }, { status: 201 })
}
