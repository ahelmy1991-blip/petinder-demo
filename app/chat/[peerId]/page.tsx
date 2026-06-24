'use client'

import { useEffect, useState, useRef, useCallback, use } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface Msg { id: string; fromId: string; toId: string; text: string; createdAt: string }
interface Peer { id: string; name: string; avatar: string }
interface PeerProfile { type: string; city: string; rating: number; reviewCount: number; verified: boolean }

const TYPE_LABELS: Record<string, string> = {
  walker: '🚶 Dog Walker', sitter: '🏠 Pet Sitter', vet: '🩺 Veterinarian',
  groomer: '✂️ Groomer', shop: '🏪 Pet Shop', hotel: '🏨 Pet Hotel',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
}

export default function ChatPage({ params }: { params: Promise<{ peerId: string }> }) {
  const { peerId } = use(params)
  const [messages, setMessages] = useState<Msg[]>([])
  const [peer, setPeer] = useState<Peer | null>(null)
  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [draft, setDraft] = useState('')
  const [meId, setMeId] = useState('')
  const [sending, setSending] = useState(false)
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
      setPeerProfile(data.peerProfile ?? null)
      setSuggestions(data.suggestions ?? [])
    }
    if (meRes.ok) setMeId((await meRes.json()).user.id)
  }, [peerId])

  useEffect(() => { load() }, [load])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const body = (text ?? draft).trim()
    if (!body || sending) return
    setDraft('')
    setSending(true)
    const res = await fetch(`/api/chat/${peerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body }),
    })
    if (res.ok) setMessages((await res.json()).messages)
    setSending(false)
  }

  const stars = peerProfile
    ? '★'.repeat(Math.round(peerProfile.rating)) + '☆'.repeat(5 - Math.round(peerProfile.rating))
    : ''

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 text-lg leading-none" aria-label="Back">←</Link>
          <span className="text-2xl">{peer?.avatar ?? '🙂'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 truncate">{peer?.name ?? '…'}</span>
              {peerProfile?.verified && <span className="text-emerald-500 text-xs">✅</span>}
            </div>
            {peerProfile && (
              <p className="text-[11px] text-gray-400 truncate">
                {TYPE_LABELS[peerProfile.type] ?? peerProfile.type} · {peerProfile.city}
                {peerProfile.rating > 0 && <span className="ml-1 text-amber-500">{stars} ({peerProfile.reviewCount})</span>}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/profile/${peerId}`}
              className="text-[11px] font-semibold border border-gray-200 px-2.5 py-1.5 rounded-full text-gray-600 hover:border-rose-300"
            >
              Profile
            </Link>
            {peerProfile && peerProfile.type !== 'shop' && (
              <Link
                href="/services"
                className="text-[11px] font-bold bg-rose-500 text-white px-2.5 py-1.5 rounded-full hover:bg-rose-600"
              >
                Book
              </Link>
            )}
          </div>
        </div>

        {/* Provider info banner */}
        {peerProfile && (
          <div className="px-4 pb-2.5 flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-base">{TYPE_LABELS[peerProfile.type]?.split(' ')[0]}</span>
              <span className="text-xs text-gray-600">{TYPE_LABELS[peerProfile.type]?.split(' ').slice(1).join(' ')}</span>
              <span className="ml-auto text-xs text-gray-400">{peerProfile.city}</span>
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">{peer?.avatar ?? '🐾'}</div>
            <p className="text-gray-400 text-sm">Start the conversation! 👋</p>
            {peerProfile && (
              <p className="text-xs text-gray-300 mt-1">
                Ask about availability, pricing or bring your pet&apos;s details.
              </p>
            )}
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.fromId === meId
          const showTime = i === messages.length - 1 ||
            new Date(messages[i + 1]?.createdAt).getTime() - new Date(m.createdAt).getTime() > 5 * 60000
          return (
            <div key={m.id} className={`flex flex-col mb-1 ${mine ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${mine
                ? 'bg-rose-500 text-white rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                {m.text}
              </div>
              {showTime && (
                <span className="text-[10px] text-gray-300 mx-1 mt-0.5">{formatTime(m.createdAt)}</span>
              )}
            </div>
          )
        })}
        {sending && (
          <div className="flex justify-end mb-1">
            <div className="bg-rose-200 text-rose-400 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input area */}
      <div className="sticky bottom-16 bg-white border-t border-gray-100 max-w-md w-full mx-auto px-4 py-2">
        {suggestions.length > 0 && showSuggestions && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { send(s); setShowSuggestions(false) }}
                className="whitespace-nowrap text-xs bg-rose-50 border border-rose-200 text-rose-600 font-medium px-3 py-1.5 rounded-full hover:bg-rose-100"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setShowSuggestions(false)}
              className="shrink-0 text-gray-300 text-xs px-2"
              aria-label="Dismiss suggestions"
            >
              ✕
            </button>
          </div>
        )}
        {!showSuggestions && suggestions.length > 0 && (
          <button
            onClick={() => setShowSuggestions(true)}
            className="text-[11px] text-rose-400 mb-1 hover:text-rose-600"
          >
            ✨ Show suggestions
          </button>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message…"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            autoComplete="off"
          />
          <button
            onClick={() => send()}
            disabled={!draft.trim() || sending}
            className="bg-rose-500 text-white w-10 h-10 rounded-full font-bold disabled:opacity-40 hover:bg-rose-600 transition-colors"
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
