'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

interface BookingItem {
  id: string
  status: string
  date: string
  price: number
  commission: number
  service: { title: string } | null
  owner: { id: string; name: string } | null
  pet: { name: string; photo: string } | null
}
interface Profile { type: string; bio: string; city: string; verified: boolean; rating: number; reviewCount: number; earnings: number }

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [notProvider, setNotProvider] = useState(false)

  const load = useCallback(async () => {
    const [meRes, bkgRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/bookings')])
    if (meRes.ok) {
      const data = await meRes.json()
      setName(data.user.name)
      setProfile(data.providerProfile)
      if (!data.providerProfile && data.user.role !== 'provider') setNotProvider(true)
    }
    if (bkgRes.ok) setBookings((await bkgRes.json()).bookings)
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  if (notProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">This area is for service providers.</p>
        <Link href="/feed" className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-full">Back to the app</Link>
      </div>
    )
  }

  const pending = bookings.filter(b => b.status === 'pending')
  const accepted = bookings.filter(b => b.status === 'accepted')
  const completed = bookings.filter(b => b.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TopBar title="Provider Hub" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {profile && (
          <div className="bg-gray-900 text-white rounded-2xl p-5 mb-4">
            <p className="font-bold text-lg">{name} {profile.verified && '✅'}</p>
            <p className="text-xs text-gray-400 capitalize mb-3">{profile.type} · {profile.city} · ⭐ {profile.rating || 'New'} ({profile.reviewCount})</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-xl font-black">{profile.earnings}</p>
                <p className="text-[10px] text-gray-400">EGP earned</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-xl font-black">{pending.length}</p>
                <p className="text-[10px] text-gray-400">pending</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-xl font-black">{completed.length}</p>
                <p className="text-[10px] text-gray-400">completed</p>
              </div>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">⏳ Requests</h2>
            {pending.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-amber-100 p-3.5 mb-2">
                <p className="text-sm font-semibold text-gray-800">{b.service?.title}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {b.pet?.photo} {b.pet?.name} · {b.owner?.name} · {new Date(b.date).toLocaleDateString()} · {b.price} EGP
                  <span className="text-gray-300"> (fee {b.commission})</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => act(b.id, 'accepted')} className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg">Accept</button>
                  <button onClick={() => act(b.id, 'rejected')} className="flex-1 bg-gray-100 text-gray-500 text-xs font-bold py-2 rounded-lg">Decline</button>
                  {b.owner && (
                    <Link href={`/chat/${b.owner.id}`} className="flex-1 text-center border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg">💬 Chat</Link>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {accepted.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">📅 Upcoming</h2>
            {accepted.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-blue-100 p-3.5 mb-2 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{b.service?.title}</p>
                  <p className="text-xs text-gray-400">{b.pet?.name} · {new Date(b.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => act(b.id, 'completed')} className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg">
                  Mark done ✓
                </button>
              </div>
            ))}
          </section>
        )}

        {completed.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">✅ History</h2>
            {completed.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-3 mb-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">{b.service?.title} · {b.pet?.name}</p>
                <span className="text-xs font-bold text-emerald-600">+{b.price - b.commission} EGP</span>
              </div>
            ))}
          </section>
        )}

        {bookings.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No bookings yet. Owners will find you in the Services tab. 🐾</p>
        )}

        <Link href="/feed" className="block text-center text-sm text-rose-500 font-semibold py-4">← Back to the app</Link>
      </main>
    </div>
  )
}
