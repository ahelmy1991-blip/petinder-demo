'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pets } from '@/lib/pets'
import Navbar from '@/components/Navbar'

export default function MatchesPage() {
  const router = useRouter()
  const [likedIds, setLikedIds] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('petinder-likes')
    if (stored) setLikedIds(JSON.parse(stored))
  }, [])

  const likedPets = pets.filter((p) => likedIds.includes(p.id))

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Navbar likeCount={likedIds.length} onLogout={handleLogout} />

      <main className="px-4 py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Matches</h1>
        <p className="text-gray-400 text-sm mb-8">Pets you loved ❤️</p>

        {likedPets.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-500 text-lg mb-6">No matches yet — go swipe some pets!</p>
            <Link href="/swipe" className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors shadow-md">
              Browse Pets
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {likedPets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-br ${pet.bgGradient} h-28 flex items-center justify-center`}>
                  <span className="text-5xl">{pet.emoji}</span>
                </div>
                <div className="p-3">
                  <div className="font-bold text-gray-900 text-sm">{pet.name}, {pet.age}y</div>
                  <div className="text-rose-500 text-xs">{pet.breed}</div>
                  <div className="text-gray-400 text-xs mt-1 truncate">📍 {pet.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/swipe" className="text-rose-500 font-semibold hover:underline text-sm">
            ← Keep swiping
          </Link>
        </div>
      </main>
    </div>
  )
}
