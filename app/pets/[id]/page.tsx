'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

interface PetDetail {
  id: string; name: string; species: string; breed: string; age: number
  gender: string; size: string; photo: string; bio: string; medical: string
  adoptable: boolean; temperament: string[]; followers: string[]; ownerId: string
}

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [pet, setPet] = useState<PetDetail | null>(null)
  const [owner, setOwner] = useState<{ id: string; name: string; avatar: string } | null>(null)
  const [meId, setMeId] = useState('')
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    const [petRes, meRes] = await Promise.all([fetch(`/api/pets/${id}`), fetch('/api/auth/me')])
    if (petRes.ok) {
      const data = await petRes.json()
      setPet(data.pet)
      setOwner(data.owner)
    } else {
      setNotFound(true)
    }
    if (meRes.ok) setMeId((await meRes.json()).user.id)
  }, [id])

  useEffect(() => { load() }, [load])

  const toggleFollow = async () => {
    const res = await fetch(`/api/pets/${id}`, { method: 'POST' })
    if (res.ok) await load()
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">Pet not found 🐾</p>
        <Link href="/feed" className="text-rose-500 font-semibold">Back to feed</Link>
      </div>
    )
  }

  const following = pet?.followers.includes(meId)
  const isMine = pet?.ownerId === meId

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/feed" className="text-gray-400" aria-label="Back">←</Link>
        <span className="font-bold text-gray-900">{pet?.name ?? '…'}</span>
      </header>

      {pet && (
        <main className="max-w-md mx-auto px-4 pt-4">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="text-[7rem] text-center py-10 bg-gradient-to-br from-rose-100 to-purple-100 relative">
              {pet.photo}
              {pet.adoptable && (
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">🏡 Adoptable</span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-black text-gray-900">{pet.name}, {pet.age}</h1>
                {!isMine && (
                  <button
                    onClick={toggleFollow}
                    className={`text-xs font-bold px-4 py-2 rounded-full ${following ? 'bg-gray-100 text-gray-500' : 'bg-rose-500 text-white'}`}
                  >
                    {following ? 'Following ✓' : '+ Follow'}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3">
                {pet.breed} · {pet.gender} · {pet.size} · {pet.followers.length} followers
              </p>
              <p className="text-sm text-gray-700 mb-3">{pet.bio || 'No bio yet.'}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {pet.temperament.map(t => (
                  <span key={t} className="bg-rose-50 text-rose-600 text-xs font-medium px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
              {pet.medical && (
                <div className="bg-blue-50 text-blue-700 text-xs rounded-xl px-3 py-2.5 mb-4">
                  🩺 {pet.medical}
                </div>
              )}
              {owner && !isMine && (
                <Link
                  href={`/chat/${owner.id}`}
                  className="block text-center bg-gray-900 text-white font-bold py-3 rounded-xl"
                >
                  💬 Message {owner.name}
                </Link>
              )}
            </div>
          </div>
        </main>
      )}
      <BottomNav />
    </div>
  )
}
