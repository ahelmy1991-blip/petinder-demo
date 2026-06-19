'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  text: string
  read: boolean
  createdAt: string
}

export default function TopBar({ title }: { title?: string }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications')
      if (!r.ok) return
      const d = await r.json()
      setNotifications(d.notifications ?? [])
      setUnread(d.unread ?? 0)
    } catch { /* network offline */ }
  }, [])

  // Initial load + poll every 15 s
  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 15000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const togglePanel = async () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      // Mark all as read
      await fetch('/api/notifications', { method: 'POST' })
      setUnread(0)
      setNotifications(n => n.map(x => ({ ...x, read: true })))
    }
  }

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
        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={togglePanel}
            aria-label="Notifications"
            className="relative text-xl leading-none"
          >
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <span className="font-bold text-sm text-gray-800">Notifications</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <div className="text-3xl mb-2">🔔</div>
                  No notifications yet
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map(n => (
                    <li key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'text-gray-500' : 'text-gray-800 bg-rose-50/40'}`}>
                      <p className="leading-snug">{n.text}</p>
                      <p className="text-[11px] text-gray-300 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="px-4 py-2 border-t border-gray-50">
                <Link
                  href="/match?tab=matches"
                  onClick={() => setOpen(false)}
                  className="text-xs text-rose-500 font-semibold hover:text-rose-600"
                >
                  View all matches →
                </Link>
              </div>
            </div>
          )}
        </div>

        <button onClick={signOut} className="text-xs text-gray-400 hover:text-rose-500 font-medium">
          Sign out
        </button>
      </div>
    </header>
  )
}
