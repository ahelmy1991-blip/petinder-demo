import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-amber-100">
        <div>
          <span className="text-2xl font-black text-rose-600 tracking-tight">🕌 Cairo Souq</span>
          <span className="text-xs text-gray-400 ms-2">سوق القاهرة</span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-sm">
            ابدأ الآن
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div className="text-7xl mb-4">🕌</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
          اكتشف أفضل ما في <span className="text-rose-500">القاهرة</span>
        </h1>
        <p className="text-lg text-gray-500 mb-2">Discover the best of Cairo</p>
        <p className="text-gray-400 text-sm mb-8 max-w-sm">
          Order from top Cairo restaurants, cafes & shops — chat with vendors, track your order, all in one place.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register" className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full text-lg hover:bg-rose-600 transition-colors shadow-lg">
            Get Started 🛒
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white text-gray-700 font-bold rounded-full text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { emoji: '🍜', labelEn: 'Restaurants', labelAr: 'مطاعم' },
          { emoji: '☕', labelEn: 'Cafes', labelAr: 'مقاهي' },
          { emoji: '🏺', labelEn: 'Shops', labelAr: 'متاجر' },
          { emoji: '🍯', labelEn: 'Sweets', labelAr: 'حلويات' },
        ].map(c => (
          <div key={c.labelEn} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{c.emoji}</div>
            <div className="font-bold text-gray-900 text-sm">{c.labelEn}</div>
            <div className="text-gray-400 text-xs">{c.labelAr}</div>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-6">
        {[
          { emoji: '🔍', titleEn: 'Browse', titleAr: 'تصفح', desc: 'Discover top-rated vendors across Cairo neighbourhoods.' },
          { emoji: '💬', titleEn: 'Chat', titleAr: 'تواصل', desc: 'Message vendors directly — ask questions, customise orders.' },
          { emoji: '🛒', titleEn: 'Order', titleAr: 'اطلب', desc: 'Add items to cart and order from multiple vendors at once.' },
        ].map(f => (
          <div key={f.titleEn} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{f.emoji}</div>
            <div className="font-bold text-gray-900 mb-0.5">{f.titleEn} / {f.titleAr}</div>
            <p className="text-gray-500 text-xs">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
