'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface Me { id: string; name: string; email: string; role: string; avatar: string; walletBalance: number }
interface Notif { id: string; text: string; read: boolean; createdAt: string }
interface OrderItem { id: string; total: number; status: string; createdAt: string; items: { name: string; quantity: number }[] }

export default function ProfilePage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [orders, setOrders] = useState<OrderItem[]>([])

  useEffect(() => {
    Promise.all([fetch('/api/auth/me'), fetch('/api/notifications'), fetch('/api/orders')]).then(
      async ([meRes, ntfRes, ordRes]) => {
        if (meRes.ok) setMe((await meRes.json()).user)
        if (ntfRes.ok) setNotifications((await ntfRes.json()).notifications)
        if (ordRes.ok) setOrders((await ordRes.json()).orders)
        // Mark notifications read
        fetch('/api/notifications', { method: 'POST' }).catch(() => {})
      },
    )
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Profile" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {me && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 text-center">
            <div className="text-5xl mb-2">{me.avatar}</div>
            <h1 className="font-black text-gray-900 text-lg">{me.name}</h1>
            <p className="text-xs text-gray-400 mb-2">{me.email} · {me.role}</p>
            {me.walletBalance > 0 && (
              <p className="text-sm font-bold text-emerald-600">💰 Wallet: {me.walletBalance} EGP</p>
            )}
            <div className="flex justify-center gap-2 mt-3">
              <Link href="/pets" className="text-xs font-semibold border border-gray-200 px-4 py-2 rounded-full text-gray-600">🐾 My pets</Link>
              {me.role === 'provider' && (
                <Link href="/provider" className="text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-full">📊 Provider dashboard</Link>
              )}
              {me.role === 'admin' && (
                <Link href="/admin" className="text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-full">🛡️ Admin</Link>
              )}
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">My orders</h2>
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-3 mb-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-gray-700">{o.id}</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{o.status}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {o.items.map(i => `${i.quantity}× ${i.name}`).join(', ')} · {o.total} EGP
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="mb-4">
          <h2 className="font-bold text-gray-900 text-sm mb-2">Notifications</h2>
          {notifications.length === 0 && <p className="text-xs text-gray-400">Nothing yet.</p>}
          {notifications.map(n => (
            <div key={n.id} className={`rounded-xl border p-3 mb-2 text-xs ${n.read ? 'bg-white border-gray-100 text-gray-500' : 'bg-rose-50 border-rose-100 text-gray-700 font-medium'}`}>
              {n.text}
              <span className="block text-[10px] text-gray-300 mt-0.5">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </section>

        <button onClick={signOut} className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl text-sm">
          Sign out
        </button>
      </main>
      <BottomNav />
    </div>
  )
}
