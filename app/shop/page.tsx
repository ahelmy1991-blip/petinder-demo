'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface ProductItem { id: string; name: string; category: string; price: number; photo: string; stock: number }

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'food', label: '🍖 Food' },
  { value: 'toys', label: '🎾 Toys' },
  { value: 'accessories', label: '🦮 Accessories' },
]

export default function ShopPage() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [recommended, setRecommended] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const [prodRes, cartRes] = await Promise.all([
      fetch(`/api/products${category ? `?category=${category}` : ''}`),
      fetch('/api/cart'),
    ])
    if (prodRes.ok) {
      const data = await prodRes.json()
      setProducts(data.products)
      setRecommended(data.recommended ?? [])
    }
    if (cartRes.ok) {
      const cart = await cartRes.json()
      setCartCount(cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0))
    }
  }, [category])

  useEffect(() => { load() }, [load])

  const addToCart = async (productId: string) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    if (res.ok) {
      setToast('Added to cart 🛒')
      setTimeout(() => setToast(''), 2000)
      await load()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Shop" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {toast && <div className="bg-emerald-500 text-white rounded-xl px-4 py-2.5 mb-3 text-sm font-semibold text-center">{toast}</div>}

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border ${category === c.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Link href="/cart" className="relative text-2xl ms-2" aria-label="Cart">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="text-5xl text-center py-6 bg-gradient-to-br from-amber-50 to-rose-50 relative">
                {p.photo}
                {recommended.includes(p.id) && (
                  <span className="absolute top-2 left-2 bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">✨ For you</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 leading-tight mb-1">{p.name}</p>
                <p className="text-[10px] text-gray-400 mb-2">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-rose-500 text-sm">{p.price} EGP</span>
                  <button
                    onClick={() => addToCart(p.id)}
                    disabled={p.stock < 1}
                    className="bg-rose-500 text-white text-xs font-bold w-7 h-7 rounded-full disabled:opacity-40"
                    aria-label={`Add ${p.name} to cart`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
