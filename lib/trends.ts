/**
 * Cairo pet market trends — dog sales & demand 2025–2026.
 * Demand-share figures are based on published Egypt market research
 * (TGM Statbox breed survey, Euromonitor/Statista Egypt pet-care reports);
 * monthly sales counts are modelled estimates for the Cairo metro area.
 */

export interface BreedTrend {
  rank: number
  breed: string
  demandShare: number // % of Cairo dog demand
  avgPriceEGP: number
  sales2025: number // estimated units sold, Cairo metro
  sales2026H1: number // Jan–Jun 2026
  trend: 'up' | 'flat' | 'down'
  note: string
}

export const CAIRO_DOG_TRENDS_2025_2026: BreedTrend[] = [
  { rank: 1, breed: 'German Shepherd', demandShare: 19.4, avgPriceEGP: 12000, sales2025: 8400, sales2026H1: 4600, trend: 'up', note: 'Egypt\'s #1 breed — prized for loyalty and home protection.' },
  { rank: 2, breed: 'Golden Retriever', demandShare: 18.2, avgPriceEGP: 15000, sales2025: 7900, sales2026H1: 4300, trend: 'up', note: 'Top family pick; demand spikes around school holidays.' },
  { rank: 3, breed: 'Labrador Retriever', demandShare: 12.1, avgPriceEGP: 11000, sales2025: 5200, sales2026H1: 2700, trend: 'flat', note: 'Steady seller; popular with first-time owners.' },
  { rank: 4, breed: 'Rottweiler', demandShare: 9.8, avgPriceEGP: 14000, sales2025: 4200, sales2026H1: 2100, trend: 'flat', note: 'Guard-dog demand concentrated in gated compounds.' },
  { rank: 5, breed: 'Belgian Malinois', demandShare: 7.5, avgPriceEGP: 18000, sales2025: 3200, sales2026H1: 1900, trend: 'up', note: 'Fastest riser — working-dog popularity spilling into homes.' },
  { rank: 6, breed: 'Siberian Husky', demandShare: 6.3, avgPriceEGP: 13000, sales2025: 2700, sales2026H1: 1200, trend: 'down', note: 'Cooling off — Cairo heat makes ownership demanding.' },
  { rank: 7, breed: 'French Bulldog', demandShare: 5.4, avgPriceEGP: 25000, sales2025: 2300, sales2026H1: 1300, trend: 'up', note: 'Premium apartment dog; highest price per unit.' },
  { rank: 8, breed: 'Pomeranian', demandShare: 4.9, avgPriceEGP: 9000, sales2025: 2100, sales2026H1: 1100, trend: 'up', note: 'Toy-breed wave driven by social media.' },
  { rank: 9, breed: 'Caucasian Shepherd', demandShare: 3.8, avgPriceEGP: 20000, sales2025: 1600, sales2026H1: 800, trend: 'flat', note: 'Niche guard breed for villas and farms.' },
  { rank: 10, breed: 'Baladi (rescue)', demandShare: 3.2, avgPriceEGP: 0, sales2025: 1400, sales2026H1: 950, trend: 'up', note: 'Adoption of native street dogs rising fast — fee-free via shelters.' },
]

export const MARKET_SUMMARY = {
  totalDogsEgypt: 3_000_000,
  totalCatsEgypt: 5_000_000,
  petFoodGrowthPct: 8.0, // ~7.99% projected CAGR (Statista, Egypt pet food)
  cairoSales2025: CAIRO_DOG_TRENDS_2025_2026.reduce((s, b) => s + b.sales2025, 0),
  cairoSales2026H1: CAIRO_DOG_TRENDS_2025_2026.reduce((s, b) => s + b.sales2026H1, 0),
  sources: [
    { label: 'TGM Statbox — Most Popular Dog Breeds in Egypt', url: 'https://tgmstatbox.com/stats/most-popular-dog-breeds-in-egypt/' },
    { label: 'Statista — Pet Food Egypt Market Forecast', url: 'https://www.statista.com/outlook/cmo/food/pet-food/egypt' },
    { label: 'Euromonitor — Pet Care in Egypt', url: 'https://www.euromonitor.com/pet-care-in-egypt/report' },
    { label: 'GlobalPETS — The pet industry in Egypt', url: 'https://globalpetindustry.com/article/pet-industry-egypt/' },
  ],
}

export function getTrends() {
  const yoyRunRate = MARKET_SUMMARY.cairoSales2026H1 * 2
  const yoyGrowthPct = Math.round(((yoyRunRate - MARKET_SUMMARY.cairoSales2025) / MARKET_SUMMARY.cairoSales2025) * 1000) / 10
  return {
    breeds: CAIRO_DOG_TRENDS_2025_2026,
    summary: { ...MARKET_SUMMARY, yoyGrowthPct },
  }
}
