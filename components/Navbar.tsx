'use client'

import Link from 'next/link'

interface Props {
  likeCount?: number
  userName?: string
  onLogout?: () => void
}

export default function Navbar({ likeCount = 0, userName, onLogout }: Props) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link href="/swipe" className="text-2xl font-black text-rose-500 tracking-tight">
        🐾 Petinder
      </Link>

      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Hi, {userName.split(' ')[0]} 👋
          </span>
        )}

        <Link href="/matches" className="relative inline-flex items-center text-gray-600 hover:text-rose-500 transition-colors">
          <span className="text-2xl">❤️</span>
          {likeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {likeCount}
            </span>
          )}
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  )
}
