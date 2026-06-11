'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import StoriesBar from '@/components/StoriesBar'
import VendorCard from '@/components/VendorCard'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import type { Vendor, Category } from '@/lib/vendors'

const CATEGORIES: { key: 'all' | Category; labelEn: string; labelAr: string }[] = [
  { key: 'all', labelEn: 'All', labelAr: 'الكل' },
  { key: 'restaurant', labelEn: 'Restaurants', labelAr: 'مطاعم' },
  { key: 'cafe', labelEn: 'Cafes', labelAr: 'مقاهي' },
  { key: 'shop', labelEn: 'Shops', labelAr: 'متاجر' },
  { key: 'sweets', labelEn: 'Sweets', labelAr: 'حلويات' },
  { key: 'juice', labelEn: 'Juices', labelAr: 'عصائر' },
  { key: 'grocery', labelEn: 'Grocery', labelAr: 'بقالة' },
]

export default function HomePage() {
  const router = useRouter()
  const { lang } = useLang()
  const tr = t[lang]

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filtered, setFiltered] = useState<Vendor[]>([])
  const [category, setCategory] = useState<'all' | Category>('all')
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      setUserName(d.user.name)
    })
    fetch('/api/vendors').then(r => r.json()).then(setVendors)
    fetch('/api/cart').then(r => r.json()).then(items => {
      if (Array.isArray(items)) setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    })
  }, [router])

  useEffect(() => {
    let list = vendors
    if (category !== 'all') list = list.filter(v => v.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(v => v.nameEn.toLowerCase().includes(q) || v.nameAr.includes(search) || v.districtEn.toLowerCase().includes(q))
    }
    setFiltered(list)
  }, [vendors, category, search])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar userName={userName} onLogout={handleLogout} />

      {/* Stories */}
      <div className="bg-white border-b border-gray-100">
        <StoriesBar vendors={vendors} lang={lang} />
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ar' ? tr.search : tr.search}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
              category === cat.key
                ? 'bg-rose-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {lang === 'ar' ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Vendor grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} lang={lang} />
        ))}
        {filtered.length === 0 && vendors.length > 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
            {lang === 'ar' ? 'لا توجد نتائج' : 'No vendors found'}
          </div>
        )}
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}
