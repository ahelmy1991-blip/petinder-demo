import Link from 'next/link'

const FEATURES = [
  { icon: '📸', title: 'Pet Social Feed', desc: 'Share your pet\'s best moments. Like, comment, follow.' },
  { icon: '💞', title: 'AI Matching', desc: 'Playdates & adoption matches scored by breed, size and temperament.' },
  { icon: '🚶', title: 'Book Services', desc: 'Walkers, sitters, vets and groomers — booked in two taps.' },
  { icon: '🛍️', title: 'Marketplace', desc: 'Food, toys and accessories from verified vendors.' },
  { icon: '💬', title: 'Built-in Chat', desc: 'Talk to providers and other pet parents, with AI suggestions.' },
  { icon: '🩺', title: 'AI Health Insights', desc: 'Describe symptoms, get guidance, find the right vet.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-rose-100">
        <span className="text-2xl font-black text-rose-500 tracking-tight">🐾 Petinder</span>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-sm">
            Join free
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight max-w-md">
          Everything your pet needs, <span className="text-rose-500">in one app</span>
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Social network, playdate matching, trusted services and a marketplace — for pet parents and pet pros.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register" className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full text-lg hover:bg-rose-600 transition-colors shadow-lg">
            Get Started 🐶
          </Link>
          <Link href="/register?role=provider" className="px-8 py-4 bg-white text-gray-700 font-bold rounded-full text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
            I&apos;m a pet pro
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-bold text-gray-900 mb-1">{f.title}</div>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
