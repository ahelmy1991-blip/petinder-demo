'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

type FilterType = 'all' | 'pets' | 'services' | 'providers'

interface PetResult { id: string; name: string; species: string; breed: string; age: number; photo: string; adoptable: boolean }
interface ServiceResult { id: string; title: string; providerName: string; price: number; homeVisit?: boolean }
interface ProviderResult { id: string; name: string; avatar: string; type: string; city: string; rating: number }

interface SearchResults {
  pets?: PetResult[]
  services?: ServiceResult[]
  providers?: ProviderResult[]
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pets', label: '🐾 Pets' },
  { value: 'services', label: '🛎️ Services' },
  { value: 'providers', label: '🧑‍⚕️ Providers' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-amber-400' : 'text-gray-300'} style={{ fontSize: '0.7rem' }}>★</span>
      ))}
    </span>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<FilterType>('all')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string, t: FilterType) => {
    if (!q.trim()) { setResults(null); setLoading(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, type: t })
      const res = await fetch(`/api/search?${params}`)
      if (res.ok) setResults(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults(null); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => search(query, type), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, type, search])

  const hasResults = results && (
    (results.pets?.length ?? 0) > 0 ||
    (results.services?.length ?? 0) > 0 ||
    (results.providers?.length ?? 0) > 0
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Search" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Search input */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pets, services, providers..."
            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${type === f.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-400 text-sm py-10">Searching...</p>
        )}

        {/* No query */}
        {!loading && !query.trim() && (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm">Type something to search</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && query.trim() && results && !hasResults && (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-gray-700 font-semibold">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-gray-400 text-sm mt-1">Try different keywords or filters</p>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <>
            {/* Pets */}
            {(results?.pets?.length ?? 0) > 0 && (
              <section className="mb-5">
                <h2 className="font-bold text-gray-900 text-sm mb-2">Pets</h2>
                {results!.pets!.map(p => (
                  <Link key={p.id} href={`/pets/${p.id}`} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2 hover:border-rose-200 transition-colors">
                    <span className="text-3xl">{p.photo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.breed} · {p.age}y · {p.species}</p>
                    </div>
                    {p.adoptable && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full shrink-0">🏡 Adoptable</span>
                    )}
                  </Link>
                ))}
              </section>
            )}

            {/* Services */}
            {(results?.services?.length ?? 0) > 0 && (
              <section className="mb-5">
                <h2 className="font-bold text-gray-900 text-sm mb-2">Services</h2>
                {results!.services!.map(s => (
                  <div key={s.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                        {s.homeVisit && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🏡 home visit</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{s.providerName}</p>
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

            {/* Providers */}
            {(results?.providers?.length ?? 0) > 0 && (
              <section className="mb-5">
                <h2 className="font-bold text-gray-900 text-sm mb-2">Providers</h2>
                {results!.providers!.map(p => (
                  <Link key={p.id} href={`/profile/${p.id}`} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2 hover:border-rose-200 transition-colors">
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.type} · {p.city}</p>
                      <StarRating rating={p.rating} />
                    </div>
                    <span className="text-gray-300 text-sm shrink-0">›</span>
                  </Link>
                ))}
              </section>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
