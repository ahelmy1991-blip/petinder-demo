'use client'

import { useEffect, useState, useCallback } from 'react'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface EventItem {
  id: string
  title: string
  description: string
  category: string
  city: string
  venue: string
  date: string
  photo: string
  attendeeCount: number
  going: boolean
  organizer: { id: string; name: string; avatar: string } | null
  petFriendlySpecies: string[]
}

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'meetup', label: '🐕 Meetups' },
  { value: 'adoption', label: '🏡 Adoption' },
  { value: 'show', label: '🏆 Shows' },
  { value: 'training', label: '🎓 Training' },
  { value: 'charity', label: '❤️ Charity' },
]

const CATEGORY_BADGES: Record<string, string> = {
  meetup: 'bg-blue-50 text-blue-600',
  adoption: 'bg-emerald-50 text-emerald-600',
  show: 'bg-amber-50 text-amber-600',
  training: 'bg-purple-50 text-purple-600',
  charity: 'bg-rose-50 text-rose-600',
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/events')
    if (res.ok) setEvents((await res.json()).events)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const rsvp = async (eventId: string) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    await load()
  }

  const visible = events.filter(e => !category || e.category === category)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Events" />
      <main className="max-w-md mx-auto px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border ${category === c.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400 text-sm py-10">Loading events…</p>}
        {!loading && visible.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No upcoming events in this category yet.</p>
        )}

        {visible.map(e => {
          const d = new Date(e.date)
          return (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="bg-rose-50 rounded-xl w-14 h-14 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-rose-400 uppercase">{d.toLocaleString('en', { month: 'short' })}</span>
                  <span className="text-lg font-black text-rose-600 leading-none">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{e.photo} {e.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    📍 {e.venue}, {e.city} · {d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_BADGES[e.category] ?? 'bg-gray-50 text-gray-500'}`}>
                    {e.category}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{e.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">👥 {e.attendeeCount} going</span>
                <button
                  onClick={() => rsvp(e.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-full ${e.going ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-500 text-white hover:bg-rose-600'}`}
                >
                  {e.going ? '✓ Going' : 'RSVP'}
                </button>
              </div>
            </div>
          )
        })}
      </main>
      <BottomNav />
    </div>
  )
}
