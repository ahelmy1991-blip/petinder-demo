import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-6">🐾</div>
      <h1 className="text-3xl font-black text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-xs">Looks like this pet wandered off...</p>
      <Link
        href="/feed"
        className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full text-lg hover:bg-rose-600 transition-colors shadow-lg"
      >
        Go home
      </Link>
    </div>
  )
}
