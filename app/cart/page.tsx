'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import type { CartItem } from '@/lib/store'

export default function CartPage() {
  const router = useRouter()
  const { lang } = useLang()
  const tr = t[lang]

  const [items, setItems] = useState<CartItem[]>([])
  const [placed, setPlaced] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      setUserName(d.user.name)
    })
    loadCart()
  }, [router])

  const loadCart = () => {
    fetch('/api/cart').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data)
    })
  }

  const updateQty = async (itemId: string, qty: number) => {
    await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    })
    loadCart()
  }

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
    loadCart()
  }

  const placeOrder = async () => {
    await fetch('/api/cart/clear', { method: 'POST' })
    setPlaced(true)
    setTimeout(() => { setItems([]); setPlaced(false) }, 3000)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  // Group items by vendor
  const byVendor = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    ;(acc[item.vendorId] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopBar userName={userName} onLogout={handleLogout} />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{tr.cart}</h1>

        {placed && (
          <div className="bg-green-50 text-green-700 rounded-2xl p-4 mb-4 text-center font-semibold">
            {tr.orderPlaced}
          </div>
        )}

        {items.length === 0 && !placed ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-2">{tr.emptyCart}</p>
            <p className="text-gray-400 text-sm mb-6">{tr.emptyCartDesc}</p>
            <Link href="/home" className="bg-rose-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-rose-600 transition-colors">
              {tr.browseVendors}
            </Link>
          </div>
        ) : (
          <>
            {Object.entries(byVendor).map(([vendorId, vendorItems]) => (
              <div key={vendorId} className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-800 text-sm">
                    {lang === 'ar' ? vendorItems[0].vendorNameAr : vendorItems[0].vendorNameEn}
                  </span>
                </div>
                {vendorItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {item.productEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {lang === 'ar' ? item.productNameAr : item.productNameEn}
                      </div>
                      <div className="text-rose-600 text-xs font-semibold">{item.price} {tr.egp}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200">-</button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200">+</button>
                      <button onClick={() => removeItem(item.id)} className="text-red-400 text-xs ms-1 hover:text-red-600">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{tr.total}</span>
                  <span className="font-bold text-gray-900">{total} {tr.egp}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{tr.delivery}</span>
                  <span>20 {tr.egp}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-3">
                  <span>{tr.total}</span>
                  <span className="text-rose-600">{total + 20} {tr.egp}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full mt-4 bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                >
                  {tr.placeOrder}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav cartCount={items.reduce((s, i) => s + i.quantity, 0)} />
    </div>
  )
}
