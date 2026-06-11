'use client'

import { useEffect, useState, useCallback } from 'react'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

interface ServiceItem {
  id: string
  type: string
  title: string
  description: string
  price: number
  durationMin: number
  homeVisit?: boolean
  provider: { id: string; name: string; avatar: string } | null
  profile: { city: string; rating: number; reviewCount: number; verified: boolean } | null
}
interface MyPet { id: string; name: string; photo: string }
interface BookingItem {
  id: string
  status: string
  date: string
  price: number
  service: { title: string } | null
  provider: { id: string; name: string } | null
  pet: { name: string } | null
}

const TYPES = [
  { value: '', label: 'All' },
  { value: 'walker', label: '🚶 Walks' },
  { value: 'sitter', label: '🏠 Sitting' },
  { value: 'vet', label: '🩺 Vets' },
  { value: 'groomer', label: '✂️ Grooming' },
  { value: 'hotel', label: '🏨 Pet Hotels' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [myPets, setMyPets] = useState<MyPet[]>([])
  const [type, setType] = useState('')
  const [homeVisitOnly, setHomeVisitOnly] = useState(false)
  const [bookingFor, setBookingFor] = useState<ServiceItem | null>(null)
  const [bookForm, setBookForm] = useState({ petId: '', date: '' })
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [reviewFor, setReviewFor] = useState<BookingItem | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (homeVisitOnly) params.set('homeVisit', '1')
    const qs = params.toString()
    const [svcRes, bkgRes, petsRes] = await Promise.all([
      fetch(`/api/services${qs ? `?${qs}` : ''}`),
      fetch('/api/bookings'),
      fetch('/api/pets?mine=1'),
    ])
    if (svcRes.ok) setServices((await svcRes.json()).services)
    if (bkgRes.ok) setBookings((await bkgRes.json()).bookings)
    if (petsRes.ok) {
      const pets = (await petsRes.json()).pets
      setMyPets(pets)
      setBookForm(f => ({ ...f, petId: f.petId || pets[0]?.id || '' }))
    }
  }, [type, homeVisitOnly])

  useEffect(() => { load() }, [load])

  const book = async () => {
    setError('')
    if (!bookingFor) return
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: bookingFor.id, petId: bookForm.petId, date: bookForm.date }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Booking failed'); return }
    setBookingFor(null)
    setToast('📅 Booking requested!')
    setTimeout(() => setToast(''), 3000)
    await load()
  }

  const cancel = async (id: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    await load()
  }

  const submitReview = async () => {
    if (!reviewFor?.provider) return
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: reviewFor.provider.id, ...reviewForm }),
    })
    if (res.ok) {
      setReviewFor(null)
      setToast('⭐ Review submitted!')
      setTimeout(() => setToast(''), 3000)
      await load()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Services" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {toast && <div className="bg-emerald-500 text-white rounded-xl px-4 py-3 mb-4 text-sm font-semibold text-center">{toast}</div>}

        {/* My bookings */}
        {bookings.length > 0 && (
          <section className="mb-5">
            <h2 className="font-bold text-gray-900 text-sm mb-2">My bookings</h2>
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-3 mb-2 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{b.service?.title}</p>
                  <p className="text-xs text-gray-400">{b.pet?.name} · {new Date(b.date).toLocaleDateString()} · {b.price} EGP</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[b.status] ?? ''}`}>{b.status}</span>
                {b.status === 'pending' && (
                  <button onClick={() => cancel(b.id)} className="text-xs text-gray-400 hover:text-rose-500">✕</button>
                )}
                {b.status === 'completed' && (
                  <button onClick={() => setReviewFor(b)} className="text-xs text-amber-500 font-semibold">Review ⭐</button>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border ${type === t.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setHomeVisitOnly(v => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border mb-3 ${homeVisitOnly ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-500 border-gray-200'}`}
        >
          🏡 At-home visits only
        </button>

        {/* Services */}
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{s.provider?.avatar ?? '🧑‍⚕️'}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  {s.title}
                  {s.homeVisit && <span className="ms-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full align-middle">🏡 home visit</span>}
                  {s.type === 'hotel' && <span className="ms-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full align-middle">🏨 boarding</span>}
                </h3>
                <p className="text-xs text-gray-400 mb-1">
                  {s.provider?.name} {s.profile?.verified && '✅'} · {s.profile?.city} · ⭐ {s.profile?.rating || 'New'} ({s.profile?.reviewCount ?? 0})
                </p>
                <p className="text-xs text-gray-600">{s.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="font-black text-rose-500">{s.price} EGP</span>
              <div className="flex gap-2">
                {s.provider && (
                  <Link href={`/chat/${s.provider.id}`} className="text-xs font-semibold border border-gray-200 px-3 py-2 rounded-full text-gray-600">
                    💬 Chat
                  </Link>
                )}
                <button
                  onClick={() => { setBookingFor(s); setError('') }}
                  className="text-xs font-bold bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600"
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Booking modal */}
      {bookingFor && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setBookingFor(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{bookingFor.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{bookingFor.price} EGP · {bookingFor.durationMin} min</p>
            {myPets.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">
                <Link href="/pets" className="text-rose-500 font-semibold">Add a pet</Link> first to book services.
              </p>
            ) : (
              <>
                <label className="block text-xs font-semibold text-gray-500 mb-1">For which pet?</label>
                <select
                  value={bookForm.petId}
                  onChange={e => setBookForm(f => ({ ...f, petId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 bg-white"
                >
                  {myPets.map(p => <option key={p.id} value={p.id}>{p.photo} {p.name}</option>)}
                </select>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={bookForm.date}
                  onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3"
                />
                {error && <p className="text-rose-500 text-xs mb-2">{error}</p>}
                <button onClick={book} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600">
                  Confirm booking · {bookingFor.price} EGP
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewFor && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setReviewFor(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900 mb-3">Review {reviewFor.provider?.name}</h3>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} className="text-2xl">
                  {n <= reviewForm.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.text}
              onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
              placeholder="How was the service?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 h-20"
            />
            <button onClick={submitReview} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl">Submit review</button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
