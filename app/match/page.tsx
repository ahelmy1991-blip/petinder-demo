'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

type MatchMode = 'walk' | 'adoption' | 'breed'

interface Candidate {
  pet: { id: string; name: string; breed: string; age: number; size: string; gender: string; photo: string; bio: string; temperament: string[]; adoptable: boolean }
  owner: { id: string; name: string } | null
  match: { score: number; reasons: string[] }
}
interface MyPet { id: string; name: string; photo: string }

interface MatchItem {
  id: string
  purpose: MatchMode
  createdAt: string
  theirPet: { id: string; name: string; breed: string; photo: string } | null
  theirOwner: { id: string; name: string; avatar: string } | null
  myPet: { id: string; name: string } | null
}

type Tab = 'discover' | 'matches'

const MODES: { value: MatchMode; label: string; icon: string; tag: string }[] = [
  { value: 'walk', label: 'Fun Walk', icon: '🚶', tag: 'Playdates & walks' },
  { value: 'adoption', label: 'Adoption', icon: '🏡', tag: 'Find a forever pet' },
  { value: 'breed', label: 'Breeding', icon: '💞', tag: 'Find a breeding match' },
]

const PURPOSE_BADGE: Record<MatchMode, { label: string; cls: string }> = {
  walk: { label: '🚶 Fun Walk', cls: 'bg-blue-50 text-blue-600' },
  adoption: { label: '🏡 Adoption', cls: 'bg-emerald-50 text-emerald-600' },
  breed: { label: '💞 Breeding', cls: 'bg-rose-50 text-rose-600' },
}

export default function MatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => searchParams.get('tab') === 'matches' ? 'matches' : 'discover')
  const [mode, setMode] = useState<MatchMode>('walk')

  // --- Discover tab state ---
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [myPets, setMyPets] = useState<MyPet[]>([])
  const [myPetId, setMyPetId] = useState('')
  const [needsPet, setNeedsPet] = useState(false)
  const [matchBanner, setMatchBanner] = useState<{ name: string; ownerId: string; mode: MatchMode } | null>(null)
  const [loadingDiscover, setLoadingDiscover] = useState(true)

  // --- Swipe gesture state ---
  const dragStart = useRef<number | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // --- Matches tab state ---
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)

  const loadDiscover = useCallback(async (petId: string | undefined, m: MatchMode) => {
    setLoadingDiscover(true)
    const params = new URLSearchParams()
    if (petId) params.set('petId', petId)
    params.set('mode', m)
    const res = await fetch(`/api/match?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setCandidates(data.candidates ?? [])
      setNeedsPet(Boolean(data.needsPet))
      setMyPets(data.myPets ?? [])
      if (data.myPet) setMyPetId(data.myPet.id)
    }
    setLoadingDiscover(false)
  }, [])

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true)
    const res = await fetch('/api/matches')
    if (res.ok) setMatches((await res.json()).matches ?? [])
    setLoadingMatches(false)
  }, [])

  // Reload candidates whenever the selected mode (or pet) changes.
  useEffect(() => { loadDiscover(myPetId || undefined, mode) }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'matches') loadMatches()
  }, [tab, loadMatches])

  const SWIPE_THRESHOLD = 80

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
    setIsSwiping(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    setDragX(e.clientX - dragStart.current)
  }
  const onPointerUp = () => {
    if (dragStart.current === null) return
    const dx = dragX
    dragStart.current = null
    setDragX(0)
    setIsSwiping(false)
    if (Math.abs(dx) >= SWIPE_THRESHOLD) swipe(dx > 0)
  }

  const swipe = async (like: boolean) => {
    const target = candidates[0]
    if (!target || !myPetId) return
    setCandidates(c => c.slice(1))
    const res = await fetch('/api/match/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ myPetId, targetPetId: target.pet.id, like, mode }),
    })
    if (res.ok) {
      const { matched, otherOwnerId } = await res.json()
      if (matched && otherOwnerId) setMatchBanner({ name: target.pet.name, ownerId: otherOwnerId, mode })
    }
  }

  const current = candidates[0]
  const activeMode = MODES.find(m => m.value === mode)!

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Match" />

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-100 flex max-w-md mx-auto">
        <button
          onClick={() => setTab('discover')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'discover' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-gray-400'}`}
        >
          Discover
        </button>
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'matches' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-gray-400'}`}
        >
          Matches
        </button>
      </div>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* ---- Discover tab ---- */}
        {tab === 'discover' && (
          <>
            {/* Match-mode selector */}
            <div className="grid grid-cols-3 gap-2 mb-1">
              {MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => { setMode(m.value); setMatchBanner(null) }}
                  className={`rounded-xl py-2.5 text-center border-2 transition ${mode === m.value ? 'border-rose-400 bg-rose-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="text-xl leading-none mb-0.5">{m.icon}</div>
                  <div className={`text-[11px] font-bold ${mode === m.value ? 'text-rose-600' : 'text-gray-500'}`}>{m.label}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mb-3">{activeMode.tag}</p>

            {matchBanner && (
              <div className="bg-rose-500 text-white rounded-2xl p-4 mb-4 text-center shadow-lg">
                <p className="font-bold mb-2">
                  🎉 It&apos;s a {PURPOSE_BADGE[matchBanner.mode].label.replace(/^.\s/, '').toLowerCase()} match with {matchBanner.name}!
                </p>
                <p className="text-xs opacity-90 mb-3">We started a chat for you in Petinder 💬</p>
                <button
                  onClick={() => router.push(`/chat/${matchBanner.ownerId}`)}
                  className="bg-white text-rose-500 text-sm font-bold px-5 py-2 rounded-full"
                >
                  Open conversation →
                </button>
              </div>
            )}

            {needsPet ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🐾</div>
                <p className="text-gray-500 mb-4">Add a pet profile to start matching</p>
                <Link href="/pets" className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-full">Add my pet</Link>
              </div>
            ) : (
              <>
                {myPets.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400">Matching for:</span>
                    <select
                      value={myPetId}
                      onChange={e => { setMyPetId(e.target.value); loadDiscover(e.target.value, mode) }}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
                    >
                      {myPets.map(p => <option key={p.id} value={p.id}>{p.photo} {p.name}</option>)}
                    </select>
                  </div>
                )}

                {loadingDiscover ? (
                  <p className="text-center text-gray-400 py-16">Finding matches…</p>
                ) : current ? (
                  <div
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                      transition: isSwiping ? 'none' : 'transform 0.3s ease',
                      touchAction: 'none',
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <div className="text-[7rem] text-center py-12 bg-gradient-to-br from-rose-100 to-purple-100 relative">
                      {dragX > 30 && (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-green-500 opacity-80 pointer-events-none" style={{ textShadow: '0 0 20px #22c55e' }}>❤️ LIKE</span>
                      )}
                      {dragX < -30 && (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-red-400 opacity-80 pointer-events-none" style={{ textShadow: '0 0 20px #f87171' }}>✖️ NOPE</span>
                      )}
                      {current.pet.photo}
                      <span className="absolute top-3 right-3 bg-white/90 text-rose-500 text-sm font-black px-3 py-1 rounded-full shadow">
                        {current.match.score}% match
                      </span>
                      <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow ${PURPOSE_BADGE[mode].cls}`}>
                        {PURPOSE_BADGE[mode].label}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-900">
                        {current.pet.name}, {current.pet.age}
                      </h2>
                      <p className="text-sm text-gray-400 mb-2">
                        {current.pet.breed} · {current.pet.gender} · {current.pet.size} · {current.owner?.name}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">{current.pet.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {current.pet.temperament.map(t => (
                          <span key={t} className="bg-rose-50 text-rose-600 text-xs font-medium px-2.5 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                      <ul className="text-xs text-gray-500 mb-4 space-y-1">
                        {current.match.reasons.map(r => <li key={r}>✨ {r}</li>)}
                      </ul>
                      <div className="flex justify-center gap-6">
                        <button
                          onPointerDown={e => e.stopPropagation()}
                          onClick={() => swipe(false)}
                          aria-label="Pass"
                          className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 text-2xl shadow hover:scale-105 transition"
                        >
                          ✖️
                        </button>
                        <button
                          onPointerDown={e => e.stopPropagation()}
                          onClick={() => swipe(true)}
                          aria-label="Like"
                          className="w-16 h-16 rounded-full bg-rose-500 text-2xl shadow-lg hover:scale-105 transition"
                        >
                          ❤️
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-3">🎯</div>
                    <p className="text-gray-500">
                      {mode === 'breed'
                        ? 'No breeding matches right now — try another pet or mode.'
                        : mode === 'adoption'
                          ? 'No adoptable pets left to review. Check back soon!'
                          : 'No more walk buddies nearby. Check back soon!'}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ---- Matches tab ---- */}
        {tab === 'matches' && (
          <>
            {loadingMatches ? (
              <p className="text-center text-gray-400 py-16">Loading matches…</p>
            ) : matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">💞</div>
                <p className="text-gray-500">No matches yet — keep swiping! 💞</p>
              </div>
            ) : (
              matches.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3 flex items-center gap-4">
                  <div className="text-5xl">{m.theirPet?.photo ?? '🐾'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{m.theirPet?.name ?? 'Pet'}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PURPOSE_BADGE[m.purpose].cls}`}>
                        {PURPOSE_BADGE[m.purpose].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.theirPet?.breed} · {m.theirOwner?.name}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Matched {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  {m.theirOwner && (
                    <Link
                      href={`/chat/${m.theirOwner.id}`}
                      className="text-xs font-bold bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 shrink-0"
                    >
                      💬 Chat
                    </Link>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
