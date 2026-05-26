'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { pets } from '@/lib/pets'
import PetCard from '@/components/PetCard'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedIds, setLikedIds] = useState<number[]>([])
  const [animation, setAnimation] = useState<'like' | 'dislike' | null>(null)
  const [showMatch, setShowMatch] = useState(false)

  useEffect(() => {
    const storedLikes = localStorage.getItem('petinder-likes')
    if (storedLikes) setLikedIds(JSON.parse(storedLikes))
    const storedIndex = localStorage.getItem('petinder-index')
    if (storedIndex) setCurrentIndex(parseInt(storedIndex, 10))
  }, [])

  const handleSwipe = (direction: 'like' | 'dislike') => {
    if (animation !== null) return

    setAnimation(direction)

    setTimeout(() => {
      if (direction === 'like') {
        const newLikes = [...likedIds, pets[currentIndex].id]
        setLikedIds(newLikes)
        localStorage.setItem('petinder-likes', JSON.stringify(newLikes))
        setShowMatch(true)
        setTimeout(() => setShowMatch(false), 1400)
      }
      const next = currentIndex + 1
      setCurrentIndex(next)
      localStorage.setItem('petinder-index', String(next))
      setAnimation(null)
    }, 350)
  }

  const reset = () => {
    setCurrentIndex(0)
    setLikedIds([])
    setAnimation(null)
    localStorage.removeItem('petinder-likes')
    localStorage.removeItem('petinder-index')
  }

  const isDone = currentIndex >= pets.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Navbar likeCount={likedIds.length} />

      <main className="flex flex-col items-center px-4 py-8">
        {isDone ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🐾</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {"You've seen everyone!"}
            </h2>
            <p className="text-gray-500 mb-8">
              You liked {likedIds.length} pet{likedIds.length !== 1 ? 's' : ''} — great taste!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/matches"
                className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors shadow-md"
              >
                View Matches ({likedIds.length})
              </Link>
              <button
                onClick={reset}
                className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:border-gray-300 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm relative">
            {showMatch && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-rose-500 text-white text-3xl font-black px-10 py-6 rounded-3xl shadow-2xl scale-100 animate-bounce">
                  {"It's a Match! 🎉"}
                </div>
              </div>
            )}

            {/* Background stack card */}
            {pets[currentIndex + 1] && (
              <div className="absolute inset-0 top-2 mx-2 bg-white rounded-3xl shadow opacity-40 -z-10" />
            )}

            <PetCard pet={pets[currentIndex]} animation={animation} />

            <div className="flex justify-center gap-10 mt-8">
              <button
                onClick={() => handleSwipe('dislike')}
                disabled={animation !== null}
                aria-label="Pass"
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 hover:shadow-xl transition-all border border-gray-100 disabled:opacity-50"
              >
                ✕
              </button>
              <button
                onClick={() => handleSwipe('like')}
                disabled={animation !== null}
                aria-label="Like"
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 hover:shadow-xl transition-all border border-rose-100 disabled:opacity-50"
              >
                ❤️
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              {currentIndex + 1} / {pets.length}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
