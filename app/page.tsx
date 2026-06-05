import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-100">
        <span className="text-2xl font-black text-rose-500 tracking-tight">🐾 Petinder</span>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
        <div className="text-8xl mb-6 animate-bounce">🐾</div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight max-w-lg">
          Find Your Perfect{' '}
          <span className="text-rose-500">Pet Companion</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-md">
          Swipe through adorable pets looking for their forever home. Your new best friend is just a tap away.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full text-lg hover:bg-rose-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Swiping 🐶
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-gray-700 font-bold rounded-full text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { emoji: '🔍', title: 'Browse', desc: 'Discover pets near you — dogs, cats, rabbits, and more.' },
          { emoji: '❤️', title: 'Match', desc: 'Like the ones you love and they go straight to your matches.' },
          { emoji: '🏠', title: 'Adopt', desc: 'Contact shelters and give a pet their forever home.' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{f.emoji}</div>
            <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
