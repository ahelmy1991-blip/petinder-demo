'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Vendor } from '@/lib/vendors'
import type { Message } from '@/lib/store'

export default function ChatPage() {
  const router = useRouter()
  const { vendorId } = useParams<{ vendorId: string }>()
  const { lang } = useLang()
  const tr = t[lang]

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
    })
    fetch(`/api/vendors/${vendorId}`).then(r => r.json()).then(v => {
      if (!v.error) setVendor(v)
    })
    fetch(`/api/messages/${vendorId}`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMessages(data)
    })
  }, [vendorId, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/messages/${vendorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-lang': lang },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    if (data.userMsg) {
      setMessages(prev => [...prev, data.userMsg, data.vendorMsg])
    }
    setText('')
    setSending(false)
    inputRef.current?.focus()
  }

  if (!vendor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">🌀</div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-500 text-xl">←</button>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${vendor.bgGradient} flex items-center justify-center text-xl`}>
          {vendor.emoji}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">
            {lang === 'ar' ? vendor.nameAr : vendor.nameEn}
          </div>
          <div className="text-xs text-green-500">{lang === 'ar' ? 'متصل الآن' : 'Online'}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            {lang === 'ar'
              ? `ابدأ محادثتك مع ${vendor.nameAr} 👋`
              : `Start your conversation with ${vendor.nameEn} 👋`}
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.senderType === 'vendor' && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${vendor.bgGradient} flex items-center justify-center text-sm me-2 flex-shrink-0 self-end`}>
                {vendor.emoji}
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.senderType === 'user'
                  ? 'bg-rose-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-1 ${msg.senderType === 'user' ? 'text-white/60' : 'text-gray-300'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={tr.typeMessage}
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-rose-500 text-white w-11 h-11 rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50"
        >
          {sending ? '…' : '➤'}
        </button>
      </form>
    </div>
  )
}
