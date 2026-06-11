'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface Candidate {
  pet: { id: string; name: string; breed: string; age: number; size: string; photo: string; bio: string; temperament: string[]; adoptable: boolean }
  owner: { id: string; name: string } | null
  match: { score: number; reasons: string[] }
}
interface MyPet { id: string; name: string; photo: string }

export default function MatchPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [myPets, setMyPets] = useState<MyPet[]>([])
  const [myPetId, setMyPetId] = useState('')
  const [needsPet, setNeedsPet] = useState(false)
  const [matchBanner, setMatchBanner] = useState<{ name: string; ownerId: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (petId?: string) => {
    setLoading(true)
    const res = await fetch(`/api/match${petId ? `?petId=${petId}` : ''}`)
    if (res.ok) {
      const data = await res.json()
      setCandidates(data.candidates ?? [])
      setNeedsPet(Boolean(data.needsPet))
      setMyPets(data.myPets ?? [])
      if (data.myPet) setMyPetId(data.myPet.id)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const swipe = async (like: boolean) => {
    const target = candidates[0]
    if (!target || !myPetId) return
    setCandidates(c => c.slice(1))
    const res = await fetch('/api/match/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ myPetId, targetPetId: target.pet.id, like }),
    })
    if (res.ok) {
      const { matched, otherOwnerId } = await res.json()
      if (matched && otherOwnerId) setMatchBanner({ name: target.pet.name, ownerId: otherOwnerId })
    }
  }

  const current = candidates[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Match" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {matchBanner && (
          <div className="bg-rose-500 text-white rounded-2xl p-4 mb-4 text-center shadow-lg">
            <p className="font-bold mb-2">🎉 It&apos;s a match with {matchBanner.name}!</p>
            <button
              onClick={() => router.push(`/chat/${matchBanner.ownerId}`)}
              className="bg-white text-rose-500 text-sm font-bold px-4 py-2 rounded-full"
            >
              Say hi 💬
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
                  onChange={e => { setMyPetId(e.target.value); load(e.target.value) }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
                >
                  {myPets.map(p => <option key={p.id} value={p.id}>{p.photo} {p.name}</option>)}
                </select>
              </div>
            )}

            {loading ? (
              <p className="text-center text-gray-400 py-16">Finding matches…</p>
            ) : current ? (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="text-[7rem] text-center py-12 bg-gradient-to-br from-rose-100 to-purple-100 relative">
                  {current.pet.photo}
                  <span className="absolute top-3 right-3 bg-white/90 text-rose-500 text-sm font-black px-3 py-1 rounded-full shadow">
                    {current.match.score}% match
                  </span>
                  {current.pet.adoptable && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      🏡 Adoptable
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    {current.pet.name}, {current.pet.age}
                  </h2>
                  <p className="text-sm text-gray-400 mb-2">{current.pet.breed} · {current.pet.size} · {current.owner?.name}</p>
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
                      onClick={() => swipe(false)}
                      aria-label="Pass"
                      className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 text-2xl shadow hover:scale-105 transition"
                    >
                      ✖️
                    </button>
                    <button
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
                <p className="text-gray-500">No more pets nearby. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
