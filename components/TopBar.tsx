'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => (r.ok ? r.json() : { unread: 0 }))
      .then(d => setUnread(d.unread ?? 0))
      .catch(() => {})
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Link href="/feed" className="text-xl font-black text-rose-500 tracking-tight">
        🐾 {title ?? 'Petinder'}
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/profile" className="relative text-xl" aria-label="Profile & notifications">
          🔔
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>
        <button onClick={signOut} className="text-xs text-gray-400 hover:text-rose-500 font-medium">
          Sign out
        </button>
      </div>
    </header>
  )
}
