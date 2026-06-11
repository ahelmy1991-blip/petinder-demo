'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

interface BreedTrend {
  rank: number
  breed: string
  demandShare: number
  avgPriceEGP: number
  sales2025: number
  sales2026H1: number
  trend: 'up' | 'flat' | 'down'
  note: string
}
interface TrendsData {
  breeds: BreedTrend[]
  summary: {
    totalDogsEgypt: number
    totalCatsEgypt: number
    petFoodGrowthPct: number
    cairoSales2025: number
    cairoSales2026H1: number
    yoyGrowthPct: number
    sources: { label: string; url: string }[]
  }
}

const TREND_ICONS = { up: '📈', flat: '➡️', down: '📉' }
const TREND_COLORS = { up: 'text-emerald-600', flat: 'text-gray-400', down: 'text-rose-500' }

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null)

  useEffect(() => {
    fetch('/api/trends').then(r => r.ok ? r.json() : null).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <TopBar title="Market Trends" />
        <p className="text-center text-gray-400 text-sm py-10">Loading market data…</p>
        <BottomNav />
      </div>
    )
  }

  const maxShare = Math.max(...data.breeds.map(b => b.demandShare))

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title="Market Trends" />
      <main className="max-w-md mx-auto px-4 pt-4">
        <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl p-5 text-white mb-4">
          <h2 className="font-black text-lg mb-1">🐕 Cairo Dog Sales — 2025 & 2026</h2>
          <p className="text-xs opacity-80 mb-3">Top-selling breeds by demand in the Cairo metro area</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/15 rounded-xl py-2">
              <p className="font-black">{data.summary.cairoSales2025.toLocaleString()}</p>
              <p className="text-[10px] opacity-80">2025 sales</p>
            </div>
            <div className="bg-white/15 rounded-xl py-2">
              <p className="font-black">{data.summary.cairoSales2026H1.toLocaleString()}</p>
              <p className="text-[10px] opacity-80">2026 H1</p>
            </div>
            <div className="bg-white/15 rounded-xl py-2">
              <p className="font-black">{data.summary.yoyGrowthPct > 0 ? '+' : ''}{data.summary.yoyGrowthPct}%</p>
              <p className="text-[10px] opacity-80">YoY run-rate</p>
            </div>
          </div>
        </div>

        {data.breeds.map(b => (
          <div key={b.rank} className="bg-white rounded-2xl border border-gray-100 p-4 mb-2.5">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-black text-gray-300 text-lg w-7">#{b.rank}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{b.breed} <span className={TREND_COLORS[b.trend]}>{TREND_ICONS[b.trend]}</span></p>
                <p className="text-[11px] text-gray-400">
                  {b.avgPriceEGP > 0 ? `~${b.avgPriceEGP.toLocaleString()} EGP avg` : 'Adoption (free)'} · {b.demandShare}% demand share
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700">{b.sales2025.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">sold 2025</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${(b.demandShare / maxShare) * 100}%` }} />
            </div>
            <p className="text-[11px] text-gray-500">{b.note}</p>
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-4">
          <h3 className="font-bold text-gray-900 text-sm mb-2">🇪🇬 Egypt market snapshot</h3>
          <ul className="text-xs text-gray-600 space-y-1 mb-3">
            <li>• ~{(data.summary.totalDogsEgypt / 1e6).toFixed(0)}M dogs and {(data.summary.totalCatsEgypt / 1e6).toFixed(0)}M cats in Egyptian households</li>
            <li>• Pet food market growing ~{data.summary.petFoodGrowthPct}% per year</li>
            <li>• German Shepherd & Golden Retriever lead nearly 40% of all demand</li>
            <li>• Baladi rescue adoption is the fastest-growing segment</li>
          </ul>
          <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Sources</p>
          {data.summary.sources.map(s => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-blue-500 hover:underline truncate">
              {s.label}
            </a>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
