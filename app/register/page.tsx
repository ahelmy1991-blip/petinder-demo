'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const PROVIDER_TYPES = [
  { value: 'walker', label: '🚶 Dog Walker' },
  { value: 'sitter', label: '🏠 Pet Sitter' },
  { value: 'vet', label: '🩺 Vet' },
  { value: 'groomer', label: '✂️ Groomer' },
  { value: 'shop', label: '🏪 Pet Shop' },
]

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [role, setRole] = useState<'owner' | 'provider'>(params.get('role') === 'provider' ? 'provider' : 'owner')
  const [form, setForm] = useState({ name: '', email: '', password: '', providerType: 'walker', city: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
      router.push(role === 'provider' ? '/provider' : '/feed')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
      <p className="text-gray-400 text-sm mb-5">Join the pet community</p>

      <div className="grid grid-cols-2 gap-2 mb-5" role="radiogroup" aria-label="Account type">
        <button
          type="button"
          onClick={() => setRole('owner')}
          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${role === 'owner' ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-500'}`}
        >
          🐶 Pet Owner
        </button>
        <button
          type="button"
          onClick={() => setRole('provider')}
          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition ${role === 'provider' ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-500'}`}
        >
          🧑‍⚕️ Pet Pro
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{role === 'provider' ? 'Business / Full Name' : 'Full Name'}</label>
          <input
            type="text" required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder={role === 'provider' ? 'Happy Paws Walking' : 'Jane Smith'}
          />
        </div>
        {role === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service type</label>
            <select
              value={form.providerType}
              onChange={e => setForm({ ...form, providerType: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            >
              {PROVIDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password" required minLength={6} value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Min. 6 characters"
          />
        </div>

        {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60 mt-1"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-rose-500 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="text-2xl font-black text-rose-500 mb-8 tracking-tight">🐾 Petinder</Link>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
