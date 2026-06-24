'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface CartLine {
  id: string
  quantity: number
  product: { id: string; name: string; price: number; photo: string; stock: number } | null
}

export default function CartPage() {
  const [items, setItems] = useState<CartLine[]>([])
  const [total, setTotal] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/cart')
    if (res.ok) {
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setQty = async (itemId: string, quantity: number) => {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    })
    await load()
  }

  const checkout = async () => {
    setPlacing(true)
    setError('')
    const res = await fetch('/api/orders', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Checkout failed')
    } else {
      setOrderId(data.order.id)
      await load()
    }
    setPlacing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Cart" />
      <main className="max-w-md mx-auto px-4 pt-4">
        {orderId && (
          <div className="bg-emerald-500 text-white rounded-2xl p-5 mb-4 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-bold">Order placed!</p>
            <p className="text-xs opacity-90">{orderId} — the vendor has been notified.</p>
          </div>
        )}

        {items.length === 0 && !orderId && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/shop" className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-full">Browse the shop</Link>
          </div>
        )}

        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-3 mb-2 flex items-center gap-3">
            <span className="text-3xl">{item.product?.photo}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{item.product?.name}</p>
              <p className="text-xs text-rose-500 font-bold">{item.product?.price} EGP</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-gray-200 text-sm" aria-label="Decrease quantity">−</button>
              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => setQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border border-gray-200 text-sm" aria-label="Increase quantity">+</button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{total} EGP</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-500">Delivery</span>
              <span className="font-semibold">Free 🎉</span>
            </div>
            {error && <p className="text-rose-500 text-xs mb-2">{error}</p>}
            <button
              onClick={checkout}
              disabled={placing}
              className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600 disabled:opacity-60"
            >
              {placing ? 'Placing order…' : `Place order · ${total} EGP`}
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
