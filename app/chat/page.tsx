'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import type { Vendor } from '@/lib/vendors'
import type { Message } from '@/lib/store'

interface Conversation {
  vendorId: string
  vendor: Vendor
  lastMessage: Message
}

export default function ChatListPage() {
  const router = useRouter()
  const { lang } = useLang()
  const tr = t[lang]

  const [convos, setConvos] = useState<Conversation[]>([])
  const [userName, setUserName] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      setUserName(d.user.name)
    })
    fetch('/api/conversations').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setConvos(data.filter((c: Conversation) => c.vendor))
    })
    fetch('/api/cart').then(r => r.json()).then(items => {
      if (Array.isArray(items)) setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar userName={userName} onLogout={handleLogout} />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{tr.chat}</h1>

        {convos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 text-lg mb-2">{tr.noConversations}</p>
            <p className="text-gray-400 text-sm mb-6">{tr.startChatting}</p>
            <Link href="/home" className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors">
              {tr.browseVendors}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {convos.map(({ vendorId, vendor, lastMessage }) => (
              <Link key={vendorId} href={`/chat/${vendorId}`}>
                <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vendor.bgGradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {vendor.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">
                      {lang === 'ar' ? vendor.nameAr : vendor.nameEn}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5 truncate">
                      {lastMessage.senderType === 'vendor' ? '' : lang === 'ar' ? 'أنت: ' : 'You: '}
                      {lastMessage.text}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300">
                    {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}
