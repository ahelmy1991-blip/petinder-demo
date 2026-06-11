'use client'

import { useEffect, useState, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface Msg { id: string; fromId: string; toId: string; text: string; createdAt: string }
interface Peer { id: string; name: string; avatar: string }

export default function ChatPage({ params }: { params: Promise<{ peerId: string }> }) {
  const { peerId } = use(params)
  const [messages, setMessages] = useState<Msg[]>([])
  const [peer, setPeer] = useState<Peer | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [meId, setMeId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const [chatRes, meRes] = await Promise.all([
      fetch(`/api/chat/${peerId}`),
      fetch('/api/auth/me'),
    ])
    if (chatRes.ok) {
      const data = await chatRes.json()
      setMessages(data.messages)
      setPeer(data.peer)
      setSuggestions(data.suggestions ?? [])
    }
    if (meRes.ok) setMeId((await meRes.json()).user.id)
  }, [peerId])

  useEffect(() => { load() }, [load])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const body = (text ?? draft).trim()
    if (!body) return
    setDraft('')
    const res = await fetch(`/api/chat/${peerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body }),
    })
    if (res.ok) setMessages((await res.json()).messages)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/chat" className="text-gray-400" aria-label="Back">←</Link>
        <span className="text-2xl">{peer?.avatar ?? '🙂'}</span>
        <span className="font-bold text-gray-900">{peer?.name ?? '…'}</span>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Say hi! 👋</p>
        )}
        {messages.map(m => {
          const mine = m.fromId === meId
          return (
            <div key={m.id} className={`flex mb-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'bg-rose-500 text-white rounded-br-md' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'}`}>
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <div className="sticky bottom-16 bg-gray-50 max-w-md w-full mx-auto px-4 pb-2">
        {suggestions.length > 0 && messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="whitespace-nowrap text-xs bg-white border border-rose-200 text-rose-500 font-medium px-3 py-1.5 rounded-full"
              >
                ✨ {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type a message…"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
          <button
            onClick={() => send()}
            className="bg-rose-500 text-white w-10 h-10 rounded-full font-bold"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
