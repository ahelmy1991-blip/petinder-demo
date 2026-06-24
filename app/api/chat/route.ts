import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

/** Conversation list: latest message per peer. */
export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const byPeer = new Map<string, (typeof db.messages)[number]>()
  for (const m of db.messages) {
    const peer = m.fromId === user.id ? m.toId : m.toId === user.id ? m.fromId : null
    if (!peer) continue
    const existing = byPeer.get(peer)
    if (!existing || m.createdAt > existing.createdAt) byPeer.set(peer, m)
  }
  const conversations = [...byPeer.entries()]
    .map(([peerId, lastMessage]) => {
      const peer = db.users.get(peerId)
      return {
        peerId,
        peer: peer ? publicUser(peer) : null,
        peerProfile: db.providerProfiles.get(peerId) ?? null,
        lastMessage,
      }
    })
    .sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
  return NextResponse.json({ conversations })
}
