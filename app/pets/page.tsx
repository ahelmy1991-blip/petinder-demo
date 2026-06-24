'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface PetItem {
  id: string; name: string; species: string; breed: string; age: number
  gender: string; size: string; photo: string; bio: string; adoptable: boolean
  temperament: string[]; followers: string[]
}

const EMOJI_OPTIONS = ['🐕', '🐶', '🐩', '🐕‍🦺', '🐈', '🐱', '🐈‍⬛', '🦜', '🐰', '🐹', '🐢', '🐠']

const EMPTY_FORM = {
  name: '', species: 'dog', breed: '', age: '1', gender: 'male',
  size: 'medium', temperament: '', medical: '', bio: '', photo: '🐕', adoptable: false,
}

export default function PetsPage() {
  const [pets, setPets] = useState<PetItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [bioLoading, setBioLoading] = useState(false)
  const [aiSymptoms, setAiSymptoms] = useState('')
  const [aiResult, setAiResult] = useState<{ insights: { insight: string; urgency: string }[]; suggestVet: boolean } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/pets?mine=1')
    if (res.ok) setPets((await res.json()).pets)
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setError('')
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
    setShowForm(false)
    setForm(EMPTY_FORM)
    await load()
  }

  const generateBio = async () => {
    setBioLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          species: form.species,
          breed: form.breed,
          age: Number(form.age),
          gender: form.gender,
          size: form.size,
          temperament: form.temperament,
          adoptable: form.adoptable,
        }),
      })
      const data = await res.json()
      if (res.ok && data.bio) setForm(f => ({ ...f, bio: data.bio }))
      else setError(data.error ?? 'Could not generate a bio')
    } catch {
      setError('Could not generate a bio. Try again.')
    } finally {
      setBioLoading(false)
    }
  }

  const checkHealth = async () => {
    if (!aiSymptoms.trim()) return
    const res = await fetch('/api/ai/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: aiSymptoms }),
    })
    if (res.ok) setAiResult(await res.json())
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="My Pets" />
      <main className="max-w-md mx-auto px-4 pt-4">
        <button
          onClick={() => setShowForm(s => !s)}
          className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl mb-4 hover:bg-rose-600"
        >
          {showForm ? 'Close' : '+ Add a pet'}
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, photo: e }))}
                  className={`text-2xl p-1.5 rounded-xl border-2 ${form.photo === e ? 'border-rose-400 bg-rose-50' : 'border-transparent'}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <input placeholder="Breed *" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <select value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="dog">Dog</option><option value="cat">Cat</option><option value="bird">Bird</option><option value="other">Other</option>
              </select>
              <input type="number" min={0} placeholder="Age" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="male">Male</option><option value="female">Female</option>
              </select>
              <select value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
              </select>
            </div>
            <input placeholder="Temperament (comma-separated: friendly, playful)" value={form.temperament} onChange={e => setForm(f => ({ ...f, temperament: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2" />
            <input placeholder="Medical notes" value={form.medical} onChange={e => setForm(f => ({ ...f, medical: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2" />

            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500">Description</label>
              <button
                type="button"
                onClick={generateBio}
                disabled={bioLoading}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 disabled:opacity-50 flex items-center gap-1"
              >
                {bioLoading ? 'Generating…' : '✨ AI Generate Bio'}
              </button>
            </div>
            <textarea
              placeholder="Tell potential adopters about this pet's personality…"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 h-24 resize-none"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <input type="checkbox" checked={form.adoptable} onChange={e => setForm(f => ({ ...f, adoptable: e.target.checked }))} />
              🏡 Available for adoption
            </label>
            {error && <p className="text-rose-500 text-xs mb-2">{error}</p>}
            <button onClick={save} className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl">Save pet</button>
          </div>
        )}

        {pets.map(p => (
          <Link key={p.id} href={`/pets/${p.id}`} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex items-center gap-4 hover:shadow-sm transition">
            <span className="text-4xl">{p.photo}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{p.name} {p.adoptable && <span className="text-[10px] bg-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full ms-1">Adoptable</span>}</p>
              <p className="text-xs text-gray-400">{p.breed} · {p.age}y · {p.size}</p>
              <p className="text-xs text-gray-300">{p.followers.length} followers</p>
            </div>
            <span className="text-gray-300">→</span>
          </Link>
        ))}

        {pets.length === 0 && !showForm && (
          <p className="text-center text-gray-400 py-8">No pets yet — add your furry friend! 🐾</p>
        )}

        {/* AI health check */}
        <section className="bg-white rounded-2xl border border-purple-100 p-4 mt-6">
          <h2 className="font-bold text-gray-900 text-sm mb-1">🩺 AI Health Check</h2>
          <p className="text-xs text-gray-400 mb-3">Describe symptoms and get instant guidance</p>
          <textarea
            value={aiSymptoms}
            onChange={e => setAiSymptoms(e.target.value)}
            placeholder="e.g. My dog is vomiting and not eating since yesterday…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm h-20 mb-2"
          />
          <button onClick={checkHealth} className="w-full bg-purple-500 text-white font-bold py-2.5 rounded-xl hover:bg-purple-600">
            Analyse symptoms ✨
          </button>
          {aiResult && (
            <div className="mt-3 space-y-2">
              {aiResult.insights.map((i, idx) => (
                <div key={idx} className={`text-xs rounded-xl px-3 py-2.5 ${i.urgency === 'high' ? 'bg-rose-50 text-rose-700' : i.urgency === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'}`}>
                  {i.urgency === 'high' ? '🚨' : i.urgency === 'medium' ? '⚠️' : 'ℹ️'} {i.insight}
                </div>
              ))}
              {aiResult.suggestVet && (
                <Link href="/services?type=vet" className="block text-center bg-rose-500 text-white text-sm font-bold py-2.5 rounded-xl">
                  Book a vet now →
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
