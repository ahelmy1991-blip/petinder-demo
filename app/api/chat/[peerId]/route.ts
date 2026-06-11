import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify, publicUser } from '@/lib/db'
import { chatSuggestions } from '@/lib/ai'

const SEED_AUTO_REPLIES = [
  'Thanks for reaching out! How can I help you and your pet today? 🐾',
  'Got it! Let me check my calendar and get right back to you.',
  'Absolutely — happy to help with that. Any special needs I should know about?',
  'Great question! Yes we can do that. When works for you?',
]

export async function GET(req: NextRequest, ctx: { params: Promise<{ peerId: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { peerId } = await ctx.params
  const peer = db.users.get(peerId)
  if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const messages = db.messages.filter(
    m => (m.fromId === user.id && m.toId === peerId) || (m.fromId === peerId && m.toId === user.id),
  )
  const peerProfile = db.providerProfiles.get(peerId) ?? null
  return NextResponse.json({
    messages,
    peer: publicUser(peer),
    peerProfile,
    suggestions: chatSuggestions(peerProfile?.type),
  })
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ peerId: string }> }) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { peerId } = await ctx.params
  const peer = db.users.get(peerId)
  if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Message text is required' }, { status: 400 })

  const msg = {
    id: nextId('msg'),
    fromId: user.id,
    toId: peerId,
    text: String(text).trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  }
  db.messages.push(msg)
  notify(peerId, `💬 New message from ${user.name}`)

  // Seeded demo providers auto-reply so the chat journey is testable end-to-end.
  const isSeedProvider = db.providerProfiles.has(peerId) && peerId.startsWith('usr_') && !peerId.startsWith('usr_demo')
  if (isSeedProvider && peer.role === 'provider') {
    const reply = {
      id: nextId('msg'),
      fromId: peerId,
      toId: user.id,
      text: SEED_AUTO_REPLIES[db.messages.length % SEED_AUTO_REPLIES.length],
      createdAt: new Date(Date.now() + 1000).toISOString(),
    }
    db.messages.push(reply)
  }

  const messages = db.messages.filter(
    m => (m.fromId === user.id && m.toId === peerId) || (m.fromId === peerId && m.toId === user.id),
  )
  return NextResponse.json({ messages }, { status: 201 })
}
