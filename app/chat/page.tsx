'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface Conversation {
  peerId: string
  peer: { name: string; avatar: string } | null
  peerProfile: { type: string } | null
  lastMessage: { text: string; createdAt: string }
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chat')
      .then(r => (r.ok ? r.json() : { conversations: [] }))
      .then(d => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Chats" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
        {!loading && conversations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500 mb-1">No conversations yet</p>
            <p className="text-gray-400 text-sm mb-4">Match with a pet or message a service provider</p>
            <Link href="/services" className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-full">Find services</Link>
          </div>
        )}
        {conversations.map(c => (
          <Link
            key={c.peerId}
            href={`/chat/${c.peerId}`}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-2 flex items-center gap-3 hover:shadow-sm transition"
          >
            <span className="text-3xl">{c.peer?.avatar ?? '🙂'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">
                {c.peer?.name}
                {c.peerProfile && <span className="text-[10px] text-rose-400 font-medium ms-1.5">{c.peerProfile.type}</span>}
              </p>
              <p className="text-xs text-gray-400 truncate">{c.lastMessage.text}</p>
            </div>
            <span className="text-[10px] text-gray-300">
              {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </Link>
        ))}
      </main>
      <BottomNav />
    </div>
  )
}
