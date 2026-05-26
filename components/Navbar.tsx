import Link from 'next/link'

interface Props {
  likeCount?: number
}

export default function Navbar({ likeCount = 0 }: Props) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-black text-rose-500 tracking-tight">
        🐾 Petinder
      </Link>
      <Link href="/matches" className="relative inline-flex items-center gap-1 text-gray-600 hover:text-rose-500 transition-colors">
        <span className="text-2xl">❤️</span>
        {likeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {likeCount}
          </span>
        )}
      </Link>
    </nav>
  )
}
