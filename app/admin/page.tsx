'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

interface Stats {
  users: number; owners: number; providers: number; pets: number; posts: number
  bookings: number; bookingsByStatus: Record<string, number>; orders: number
  gmv: number; platformRevenue: number; matches: number; messages: number
}
interface AdminUser {
  id: string; name: string; email: string; role: string; avatar: string; banned: boolean
  petCount: number
  providerProfile: { type: string; verified: boolean; rating: number } | null
}
interface ScrapeStatus {
  lastRun: string | null
  counts: { pets: number; adoptable: number; providers: number; products: number; services: number }
}
interface ScrapeResult {
  pets: number; providers: number; products: number; services: number
  source: 'api' | 'curated'; errors: string[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [denied, setDenied] = useState(false)
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus | null>(null)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null)
  const [scraping, setScraping] = useState(false)
  const [scrapeCategory, setScrapeCategory] = useState<'all' | 'pets' | 'shops' | 'services'>('all')

  const load = useCallback(async () => {
    const [statsRes, usersRes, scrapeRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/users'),
      fetch('/api/scrape'),
    ])
    if (statsRes.status === 403 || statsRes.status === 401) { setDenied(true); return }
    if (statsRes.ok) setStats((await statsRes.json()).stats)
    if (usersRes.ok) setUsers((await usersRes.json()).users)
    if (scrapeRes.ok) setScrapeStatus(await scrapeRes.json())
  }, [])

  useEffect(() => { load() }, [load])

  const act = async (userId: string, action: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })
    await load()
  }

  const runScrape = async () => {
    setScraping(true)
    setScrapeResult(null)
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: scrapeCategory }),
    })
    if (res.ok) {
      const data = await res.json()
      setScrapeResult(data)
      setScrapeStatus(data.status)
    }
    setScraping(false)
    await load()
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">🛡️ Admins only.</p>
        <Link href="/feed" className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-full">Back to the app</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TopBar title="Admin" />
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { label: 'GMV', value: `${stats.gmv} EGP`, accent: 'text-emerald-600' },
                { label: 'Revenue', value: `${stats.platformRevenue} EGP`, accent: 'text-rose-500' },
                { label: 'Users', value: stats.users, accent: 'text-gray-900' },
                { label: 'Bookings', value: stats.bookings, accent: 'text-gray-900' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                  <p className={`text-xl font-black ${c.accent}`}>{c.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                ['Owners', stats.owners], ['Providers', stats.providers], ['Pets', stats.pets],
                ['Posts', stats.posts], ['Matches', stats.matches], ['Orders', stats.orders],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="font-black text-gray-900">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Data Scraper Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Live Data Scraper</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Fetches real breeds from TheDogAPI &amp; TheCatAPI + curated Egyptian shops &amp; services
              </p>
            </div>
            <span className="text-2xl">🔍</span>
          </div>

          {scrapeStatus && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center mb-3 bg-gray-50 rounded-xl p-3">
              {[
                ['Pets', scrapeStatus.counts.pets],
                ['Adoptable', scrapeStatus.counts.adoptable],
                ['Providers', scrapeStatus.counts.providers],
                ['Products', scrapeStatus.counts.products],
                ['Services', scrapeStatus.counts.services],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <p className="font-black text-gray-900 text-sm">{v}</p>
                  <p className="text-[10px] text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          )}

          {scrapeStatus?.lastRun && (
            <p className="text-[11px] text-gray-400 mb-2">Last run: {new Date(scrapeStatus.lastRun).toLocaleString()}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={scrapeCategory}
              onChange={e => setScrapeCategory(e.target.value as typeof scrapeCategory)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700"
            >
              <option value="all">All categories</option>
              <option value="pets">Pets only</option>
              <option value="shops">Shops & products only</option>
              <option value="services">Services & providers only</option>
            </select>
            <button
              onClick={runScrape}
              disabled={scraping}
              className="text-xs font-bold bg-rose-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {scraping ? 'Scraping…' : 'Run Scraper'}
            </button>
          </div>

          {scrapeResult && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Added — Pets: {scrapeResult.pets} · Providers: {scrapeResult.providers} · Products: {scrapeResult.products} · Services: {scrapeResult.services}
              </p>
              <p className="text-[11px] text-gray-400">Source: {scrapeResult.source === 'api' ? '🌐 Live API' : '📋 Curated dataset'}</p>
              {scrapeResult.errors.length > 0 && (
                <p className="text-[11px] text-amber-600 mt-1">Warnings: {scrapeResult.errors.join(' | ')}</p>
              )}
            </div>
          )}
        </div>

        <h2 className="font-bold text-gray-900 text-sm mb-2">Users & providers</h2>
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-3 mb-2 flex items-center gap-3">
            <span className="text-2xl">{u.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {u.name}
                {u.banned && <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full ms-1.5">banned</span>}
                {u.providerProfile?.verified && ' ✅'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {u.email} · {u.role}{u.providerProfile ? ` (${u.providerProfile.type})` : ''} · {u.petCount} pets
              </p>
            </div>
            {u.role !== 'admin' && (
              <div className="flex gap-1.5">
                {u.providerProfile && !u.providerProfile.verified && (
                  <button onClick={() => act(u.id, 'verify')} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg">Verify</button>
                )}
                <button
                  onClick={() => act(u.id, u.banned ? 'unban' : 'ban')}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${u.banned ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {u.banned ? 'Unban' : 'Ban'}
                </button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
