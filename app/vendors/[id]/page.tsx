'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Vendor, Product } from '@/lib/vendors'

export default function VendorPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { lang } = useLang()
  const tr = t[lang]

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch(`/api/vendors/${id}`).then(r => r.json()).then(v => {
      if (v.error) { router.push('/home'); return }
      setVendor(v)
    })
    fetch('/api/saved').then(r => r.json()).then(saved => {
      if (Array.isArray(saved)) setIsSaved(saved.some((v: Vendor) => v.id === id))
    })
    fetch('/api/cart').then(r => r.json()).then(items => {
      if (Array.isArray(items)) setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    })
  }, [id, router])

  const addToCart = async (product: Product) => {
    if (!vendor) return
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: vendor.id,
        vendorNameEn: vendor.nameEn,
        vendorNameAr: vendor.nameAr,
        productId: product.id,
        productNameEn: product.nameEn,
        productNameAr: product.nameAr,
        productEmoji: product.emoji,
        price: product.price,
        quantity: 1,
      }),
    })
    setAddedItems(prev => new Set(prev).add(product.id))
    setCartCount(c => c + 1)
    setTimeout(() => setAddedItems(prev => { const s = new Set(prev); s.delete(product.id); return s }), 1500)
  }

  const toggleSave = async () => {
    await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: id, remove: isSaved }),
    })
    setIsSaved(s => !s)
  }

  if (!vendor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">🌀</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${vendor.bgGradient} h-52 flex items-center justify-center relative`}>
        <button onClick={() => router.back()} className="absolute top-4 start-4 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center text-white">
          ←
        </button>
        <span className="text-8xl">{vendor.emoji}</span>
        <button
          onClick={toggleSave}
          className="absolute top-4 end-4 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center text-xl"
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-gray-900">
                {lang === 'ar' ? vendor.nameAr : vendor.nameEn}
              </h1>
              {vendor.verified && <span className="text-blue-500 text-sm">✓</span>}
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              📍 {lang === 'ar' ? vendor.districtAr : vendor.districtEn}
            </p>
          </div>
          <div className="text-end">
            <div className="text-amber-500 font-semibold text-sm">⭐ {vendor.rating}</div>
            <div className="text-gray-400 text-xs">({vendor.reviewCount.toLocaleString()} {tr.reviews})</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mt-3 leading-relaxed">
          {lang === 'ar' ? vendor.descAr : vendor.descEn}
        </p>

        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span>🕐 {vendor.deliveryTime} {tr.deliveryTime}</span>
          <span>💰 {tr.minOrder} {vendor.minOrder} {tr.egp}</span>
          <span>📞 {vendor.phone}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/chat/${vendor.id}`}
            className="flex-1 bg-rose-500 text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
          >
            💬 {tr.chatWithVendor}
          </Link>
          <button
            onClick={toggleSave}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${isSaved ? 'border-rose-500 text-rose-500' : 'border-gray-200 text-gray-600'}`}
          >
            {isSaved ? tr.saved2 : tr.saveVendor}
          </button>
        </div>
      </div>

      {/* Menu / Products */}
      <div className="px-4 py-4">
        <h2 className="font-bold text-gray-900 mb-3">
          {lang === 'ar' ? 'القائمة' : 'Menu'}
        </h2>
        <div className="flex flex-col gap-3">
          {vendor.products.map(product => (
            <div key={product.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0">
                {product.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">
                  {lang === 'ar' ? product.nameAr : product.nameEn}
                </div>
                <div className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                  {lang === 'ar' ? product.descAr : product.descEn}
                </div>
                <div className="text-rose-600 font-bold text-sm mt-1">
                  {product.price} {tr.egp}
                </div>
              </div>
              <button
                onClick={() => addToCart(product)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  addedItems.has(product.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {addedItems.has(product.id) ? '✓' : '+'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <Link
            href="/cart"
            className="bg-rose-500 text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl"
          >
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{cartCount}</span>
            <span className="font-semibold">{tr.viewCart}</span>
            <span>🛒</span>
          </Link>
        </div>
      )}
    </div>
  )
}
