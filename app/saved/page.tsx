'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import VendorCard from '@/components/VendorCard'
import type { Vendor } from '@/lib/vendors'

export default function SavedPage() {
  const router = useRouter()
  const { lang } = useLang()
  const tr = t[lang]

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      setUserName(d.user.name)
    })
    fetch('/api/saved').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setVendors(data)
    })
    fetch('/api/cart').then(r => r.json()).then(items => {
      if (Array.isArray(items)) setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar userName={userName} onLogout={handleLogout} />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{tr.saved}</h1>

        {vendors.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-gray-500 text-lg mb-2">{tr.noSaved}</p>
            <p className="text-gray-400 text-sm mb-6">{tr.noSavedDesc}</p>
            <Link href="/home" className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors">
              {tr.browseVendors}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {vendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} lang={lang} />
            ))}
          </div>
        )}
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}
