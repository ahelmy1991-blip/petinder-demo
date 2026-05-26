'use client'

import { Pet } from '@/lib/pets'

interface Props {
  pet: Pet
  animation: 'like' | 'dislike' | null
}

export default function PetCard({ pet, animation }: Props) {
  const style: React.CSSProperties =
    animation === 'like'
      ? { transform: 'translateX(160%) rotate(15deg)', opacity: 0 }
      : animation === 'dislike'
      ? { transform: 'translateX(-160%) rotate(-15deg)', opacity: 0 }
      : { transform: 'translateX(0) rotate(0deg)', opacity: 1 }

  return (
    <div
      style={style}
      className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 select-none"
    >
      <div className={`bg-gradient-to-br ${pet.bgGradient} h-64 flex items-center justify-center`}>
        <span className="text-9xl drop-shadow-sm">{pet.emoji}</span>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
          <span className="text-xl text-gray-500">{pet.age}y</span>
          <span className="text-sm text-gray-400 capitalize">{pet.gender}</span>
        </div>
        <p className="text-rose-500 font-semibold text-sm mb-1">{pet.breed}</p>
        <p className="text-gray-400 text-xs mb-3">📍 {pet.location}</p>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{pet.description}</p>
        <div className="flex flex-wrap gap-2">
          {pet.traits.map((trait) => (
            <span
              key={trait}
              className="bg-rose-50 text-rose-600 text-xs font-medium px-3 py-1 rounded-full border border-rose-100"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
