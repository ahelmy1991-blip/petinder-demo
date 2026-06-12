import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Petinder — Cairo\'s #1 Pet Platform',
}

const FEATURES = [
  { icon: '📸', title: 'Pet Social Feed', desc: 'Share your pet\'s best moments. Like, comment, follow other Cairo pet parents.' },
  { icon: '💞', title: 'AI Matching', desc: 'Playdates & adoption matches scored by breed, size and temperament compatibility.' },
  { icon: '🏨', title: 'Pet Hotels', desc: 'Travel worry-free — trusted Cairo hotels with webcam access and airport pickup.' },
  { icon: '🩺', title: 'Home-Visit Vets', desc: 'Licensed vets come to your door across Maadi, Heliopolis, New Cairo and beyond.' },
  { icon: '🛍️', title: 'Marketplace', desc: 'Royal Canin, Orijen, KONG and more — from verified Cairo pet shops.' },
  { icon: '🎪', title: 'Local Events', desc: 'Dog park meetups, adoption days, training bootcamps and charity runs near you.' },
]

const STEPS = [
  { n: '1', title: 'Create your pet\'s profile', desc: 'Add your dog, cat, or bird in under a minute.' },
  { n: '2', title: 'Match, book or shop', desc: 'Swipe for playdates, book a vet at home, or order food.' },
  { n: '3', title: 'Connect with Cairo\'s pet community', desc: 'Chat with providers, RSVP to events, share moments.' },
]

const STATS = [
  { value: '21+', label: 'Verified providers' },
  { value: '31+', label: 'Pet profiles' },
  { value: '10', label: 'Cairo districts' },
  { value: '4.8★', label: 'Avg provider rating' },
]

const TESTIMONIALS = [
  { name: 'Sara H.', avatar: '👩', pet: 'Golden Retriever owner', text: 'Found an amazing dog walker in New Cairo within minutes. Luna gets daily GPS-tracked walks now!' },
  { name: 'Karim A.', avatar: '👨', pet: 'German Shepherd + rescue cat', text: 'The home-visit vet feature is a game changer. No more stressful clinic trips for my anxious GSD.' },
  { name: 'Nour M.', avatar: '🧕', pet: 'Vet clinic owner', text: 'Our bookings doubled in the first month. The platform handles everything — payments, reminders, reviews.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur border-b border-gray-100">
        <span className="text-xl font-black text-rose-500 tracking-tight">🐾 Petinder</span>
        <div className="flex gap-2 items-center">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-sm">
            Join free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-purple-50 flex flex-col items-center text-center px-6 pt-16 pb-16">
        <div className="text-6xl mb-4 animate-bounce">🐾</div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight max-w-lg">
          Cairo&apos;s #1 app for <span className="text-rose-500">pet parents</span>
        </h1>
        <p className="text-gray-500 text-lg mb-2 max-w-md">
          Social network · AI matching · Home-visit vets · Pet hotels · Marketplace
        </p>
        <p className="text-sm text-gray-400 mb-8">Serving Cairo, Giza, Heliopolis, Maadi, New Cairo & more</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/register" className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full text-base hover:bg-rose-600 transition-colors shadow-lg">
            Get started free 🐶
          </Link>
          <Link href="/register?role=provider" className="px-8 py-4 bg-white text-gray-700 font-bold rounded-full text-base border-2 border-gray-200 hover:border-rose-300 transition-colors">
            I&apos;m a pet pro ›
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-rose-500 text-white py-6 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Everything under one 🐾</h2>
        <p className="text-gray-400 text-center text-sm mb-10">Built for Cairo pet parents and pet professionals</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-100 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-gray-900 mb-1">{f.title}</div>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">How it works</h2>
          <div className="space-y-6">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {s.n}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{s.title}</p>
                  <p className="text-gray-500 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-block px-8 py-4 bg-rose-500 text-white font-bold rounded-full hover:bg-rose-600 transition-colors shadow-lg">
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Loved by Cairo pet families</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-gray-700 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.pet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For providers CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-3">Are you a pet professional?</h2>
          <p className="text-gray-300 text-sm mb-6">
            Join 21+ verified Cairo providers — walkers, vets, groomers, hotels and shops. Get bookings, manage earnings and grow your practice.
          </p>
          <Link href="/register?role=provider" className="inline-block px-8 py-4 bg-rose-500 text-white font-bold rounded-full hover:bg-rose-600 transition-colors">
            List your services →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        <p className="font-bold text-gray-900 mb-1">🐾 Petinder</p>
        <p>Cairo&apos;s #1 pet platform · Serving pet parents across Greater Cairo since 2025</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/login" className="hover:text-rose-500">Sign in</Link>
          <Link href="/register" className="hover:text-rose-500">Join free</Link>
          <Link href="/trends" className="hover:text-rose-500">Market trends</Link>
        </div>
      </footer>
    </div>
  )
}
