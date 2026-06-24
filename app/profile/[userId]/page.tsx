'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

interface PubUser { id: string; name: string; role: string; avatar: string; createdAt: string }
interface PubProvider { type: string; bio: string; city: string; verified: boolean; rating: number; reviewCount: number }
interface PubPet { id: string; name: string; species: string; breed: string; age: number; photo: string; adoptable: boolean }
interface PubPost { id: string; content: string; photo: string; likes: string[]; createdAt: string }
interface PubService { id: string; type: string; title: string; description: string; price: number; homeVisit?: boolean }
interface PubReview { id: string; authorName: string; authorAvatar: string; rating: number; text: string; createdAt: string }
interface PubStats { petCount: number; postCount: number; followerCount: number; reviewCount: number }

interface ProfileData {
  user: PubUser
  provider?: PubProvider
  pets: PubPet[]
  posts: PubPost[]
  services: PubService[]
  reviews: PubReview[]
  stats: PubStats
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  )
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/users/${userId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="Profile" />
        <p className="text-center text-gray-400 py-20">Loading...</p>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar title="Profile" />
        <div className="text-center py-20 px-6">
          <div className="text-5xl mb-3">🐾</div>
          <p className="text-gray-500">This profile doesn&apos;t exist.</p>
          <Link href="/feed" className="mt-4 inline-block text-rose-500 font-semibold text-sm">Go home</Link>
        </div>
      </div>
    )
  }

  const { user, provider, pets, posts, services, reviews, stats } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar with back arrow */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-rose-500 text-xl font-bold leading-none"
          aria-label="Go back"
        >
          ←
        </button>
        <span className="text-base font-bold text-gray-900 truncate flex-1">{user.name}</span>
        <Link
          href={`/chat/${user.id}`}
          className="text-sm font-bold bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 shrink-0"
        >
          💬 Message
        </Link>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 pb-10">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 text-center">
          <div className="text-6xl mb-3">{user.avatar}</div>
          <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1 rounded-full capitalize">{user.role}</span>
            {provider?.city && (
              <span className="text-xs text-gray-400">📍 {provider.city}</span>
            )}
            {provider?.verified && (
              <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">✅ Verified</span>
            )}
          </div>

          {provider && (
            <div className="mt-3">
              <div className="flex items-center justify-center gap-1.5">
                <StarRating rating={provider.rating} />
                <span className="text-sm text-gray-500">{provider.rating.toFixed(1)} ({provider.reviewCount} reviews)</span>
              </div>
              {provider.bio && (
                <p className="text-sm text-gray-600 mt-2 text-left">{provider.bio}</p>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 grid grid-cols-4 divide-x divide-gray-100 text-center">
          <div>
            <p className="text-lg font-black text-gray-900">{stats.petCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Pets</p>
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">{stats.postCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Posts</p>
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">{stats.followerCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Followers</p>
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">{stats.reviewCount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Reviews</p>
          </div>
        </div>

        {/* Services (provider only) */}
        {provider && services.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">Services</h2>
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                    {s.homeVisit && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🏡 home visit</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-rose-500">{s.price} EGP</span>
                  <Link href="/services" className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-full hover:bg-rose-600">
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">Reviews</h2>
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{r.authorAvatar}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.authorName}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.text && <p className="text-xs text-gray-600">{r.text}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Pets */}
        {pets.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">Pets</h2>
            <div className="grid grid-cols-2 gap-2">
              {pets.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                  <div className="text-4xl mb-1">{p.photo}</div>
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.breed} · {p.age}y</p>
                  {p.adoptable && (
                    <span className="mt-1 inline-block text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🏡 Adoptable</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent posts */}
        {posts.length > 0 && (
          <section className="mb-4">
            <h2 className="font-bold text-gray-900 text-sm mb-2">Recent posts</h2>
            {posts.slice(0, 3).map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2">
                {p.photo && <div className="text-3xl mb-1">{p.photo}</div>}
                <p className="text-sm text-gray-700">{p.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">❤️ {p.likes.length} likes</span>
                  <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
