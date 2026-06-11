/**
 * Cairo vendor scraper — targets yellowpages.com.eg
 * Falls back to seeded data when network is unavailable.
 */
import { vendors as seededVendors } from './vendors'
import type { Vendor } from './vendors'

// In-memory scraped vendors store
const scrapedVendors: Vendor[] = []
let lastScrapeAt: string | null = null

export async function scrapeAndMerge(category = 'restaurant'): Promise<{
  scraped: number
  total: number
  lastScrapeAt: string | null
  error?: string
}> {
  try {
    // Dynamic import so cheerio is only loaded server-side
    const cheerio = await import('cheerio')
    const nodeFetch = (await import('node-fetch')).default

    const url = `https://www.yellowpages.com.eg/en/search?keyword=${encodeURIComponent(category)}&location=cairo`
    const res = await (nodeFetch as typeof fetch)(url as RequestInfo, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CairoSouqBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const html = await res.text()
    const $ = cheerio.load(html)

    // yellowpages.com.eg listing selectors
    $('.listing-item, .business-listing, [data-testid="listing"]').each((_: number, el: cheerio.Element) => {
      const nameEn = $(el).find('.business-name, h2, .name').first().text().trim()
      const districtEn = $(el).find('.address, .location').first().text().trim().split(',')[0] || 'Cairo'
      const phone = $(el).find('.phone, .tel').first().text().trim()
      const rating = parseFloat($(el).find('.rating, .stars').first().attr('data-rating') || '0')

      if (!nameEn) return

      // Avoid duplicates with seeded vendors
      const alreadyExists =
        seededVendors.some(v => v.nameEn.toLowerCase() === nameEn.toLowerCase()) ||
        scrapedVendors.some(v => v.nameEn.toLowerCase() === nameEn.toLowerCase())
      if (alreadyExists) return

      const vendor: Vendor = {
        id: `scraped-${nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        nameEn,
        nameAr: nameEn, // fallback — no Arabic from scrape
        category: category as Vendor['category'],
        districtEn: districtEn || 'Cairo',
        districtAr: districtEn || 'القاهرة',
        descEn: `${nameEn} — found via Cairo directory listing.`,
        descAr: `${nameEn} — موجود في دليل القاهرة.`,
        emoji: category === 'restaurant' ? '🍽️' : category === 'cafe' ? '☕' : '🏪',
        bgGradient: 'from-gray-500 to-slate-600',
        rating: rating || 4.0,
        reviewCount: 0,
        deliveryTime: '30-45',
        minOrder: 100,
        phone: phone || 'N/A',
        products: [],
        stories: [],
        verified: false,
        source: 'scraped',
      }

      scrapedVendors.push(vendor)
    })

    lastScrapeAt = new Date().toISOString()
    return { scraped: scrapedVendors.length, total: seededVendors.length + scrapedVendors.length, lastScrapeAt }
  } catch (err) {
    return {
      scraped: scrapedVendors.length,
      total: seededVendors.length + scrapedVendors.length,
      lastScrapeAt,
      error: err instanceof Error ? err.message : 'Scrape failed',
    }
  }
}

export function getAllVendors(): Vendor[] {
  return [...seededVendors, ...scrapedVendors]
}

export function getScraperStatus() {
  return { seeded: seededVendors.length, scraped: scrapedVendors.length, lastScrapeAt }
}
