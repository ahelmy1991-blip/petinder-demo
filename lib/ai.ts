/**
 * Petinder AI features (MVP — deterministic heuristics).
 * Production: swap each function for a Claude API call; the interfaces stay stable.
 */
import { db, Pet, Product, Service } from './db'

// ---------- Pet matching ----------

const TEMPERAMENT_AFFINITY: Record<string, string[]> = {
  energetic: ['energetic', 'playful', 'friendly'],
  playful: ['playful', 'energetic', 'cuddly'],
  calm: ['calm', 'independent', 'cuddly'],
  friendly: ['friendly', 'playful', 'energetic', 'loyal'],
  loyal: ['loyal', 'friendly', 'protective'],
  protective: ['loyal', 'calm'],
  independent: ['independent', 'calm'],
  cuddly: ['cuddly', 'playful', 'calm'],
  vocal: ['vocal', 'playful'],
}

export interface MatchScore {
  score: number // 0–100
  reasons: string[]
}

export function matchScore(a: Pet, b: Pet): MatchScore {
  let score = 50
  const reasons: string[] = []

  if (a.species === b.species) {
    score += 20
    reasons.push(`Both are ${a.species}s`)
  } else {
    score -= 25
    reasons.push('Different species — supervised intros recommended')
  }

  if (a.size === b.size) {
    score += 10
    reasons.push('Similar size — safe play')
  } else if ((a.size === 'large' && b.size === 'small') || (a.size === 'small' && b.size === 'large')) {
    score -= 10
    reasons.push('Big size gap — watch rough play')
  }

  const affinity = a.temperament.filter(t =>
    b.temperament.some(bt => (TEMPERAMENT_AFFINITY[t] ?? [t]).includes(bt))
  )
  score += Math.min(20, affinity.length * 8)
  if (affinity.length) reasons.push(`Compatible temperament: ${affinity.join(', ')}`)

  if (Math.abs(a.age - b.age) <= 2) {
    score += 5
    reasons.push('Close in age')
  }

  return { score: Math.max(0, Math.min(100, score)), reasons }
}

// ---------- Health insights ----------

const SYMPTOM_RULES: { keywords: string[]; insight: string; urgency: 'low' | 'medium' | 'high' }[] = [
  { keywords: ['vomit', 'throwing up', 'nausea'], insight: 'Possible GI upset. Withhold food 6–12h, offer water. If it persists >24h or contains blood, see a vet.', urgency: 'medium' },
  { keywords: ['not eating', 'appetite', 'refuses food'], insight: 'Appetite loss can signal dental pain, GI issues or stress. Monitor 24h; vet visit if it continues.', urgency: 'medium' },
  { keywords: ['scratch', 'itch', 'skin', 'rash'], insight: 'Likely allergies, fleas or dermatitis. Check coat for parasites; a groomer or vet can confirm.', urgency: 'low' },
  { keywords: ['limp', 'leg', 'paw', 'won\'t walk'], insight: 'Possible sprain or paw injury. Restrict activity and inspect the paw. If no improvement in 48h, see a vet.', urgency: 'medium' },
  { keywords: ['breathing', 'choking', 'collapse', 'seizure', 'blood'], insight: 'These are emergency signs. Go to the nearest vet clinic immediately.', urgency: 'high' },
  { keywords: ['diarrhea', 'loose stool'], insight: 'Often dietary. Bland diet 24h + hydration. Vet if bloody or lasting >48h.', urgency: 'medium' },
  { keywords: ['tired', 'lethargic', 'sleeping'], insight: 'Lethargy with other symptoms warrants a checkup; alone it may be heat or age related.', urgency: 'low' },
]

export interface HealthInsight {
  insight: string
  urgency: 'low' | 'medium' | 'high'
  suggestVet: boolean
}

export function healthInsights(symptoms: string): HealthInsight[] {
  const text = symptoms.toLowerCase()
  const hits = SYMPTOM_RULES.filter(r => r.keywords.some(k => text.includes(k)))
  if (!hits.length) {
    return [{
      insight: 'No specific pattern recognised. Monitor your pet and book a general checkup if symptoms persist.',
      urgency: 'low',
      suggestVet: false,
    }]
  }
  return hits.map(h => ({ insight: h.insight, urgency: h.urgency, suggestVet: h.urgency !== 'low' }))
}

// ---------- Chat suggestions ----------

export function chatSuggestions(providerType?: string): string[] {
  switch (providerType) {
    case 'walker':
      return ['Is tomorrow morning available?', 'Do you send GPS updates during the walk?', 'My dog pulls on the leash — is that OK?']
    case 'sitter':
      return ['Do you board multiple pets at once?', 'Can you send daily photo updates?', 'My pet has a special diet — can you handle it?']
    case 'vet':
      return ['Do you have an opening this week?', 'What vaccines does my pet need?', 'Do you handle emergencies?']
    case 'groomer':
      return ['How long does a full groom take?', 'Do you handle anxious pets?', 'What is included in the price?']
    case 'shop':
      return ['Is this in stock?', 'Do you deliver today?', 'What do you recommend for a puppy?']
    default:
      return ['Hi! Is your pet up for a playdate?', 'Your pet is adorable! 😍', 'Where do you usually go for walks?']
  }
}

// ---------- Recommendations ----------

export function recommendProducts(userId: string, limit = 3): Product[] {
  const myPets = [...db.pets.values()].filter(p => p.ownerId === userId)
  const products = [...db.products.values()].filter(p => p.stock > 0)
  const hasDog = myPets.some(p => p.species === 'dog')
  const hasCat = myPets.some(p => p.species === 'cat')
  const scored = products.map(p => {
    let s = 0
    const n = p.name.toLowerCase()
    if (hasDog && (n.includes('dog') || n.includes('leash') || n.includes('ball'))) s += 2
    if (hasCat && n.includes('cat')) s += 2
    if (p.category === 'food') s += 1
    return { p, s }
  })
  return scored.sort((x, y) => y.s - x.s).slice(0, limit).map(x => x.p)
}

export function recommendServices(userId: string, limit = 3): Service[] {
  const myPets = [...db.pets.values()].filter(p => p.ownerId === userId)
  const services = [...db.services.values()]
  const hasDog = myPets.some(p => p.species === 'dog')
  const scored = services.map(s => {
    let score = 0
    if (hasDog && s.type === 'walker') score += 2
    if (s.type === 'vet') score += 1
    return { s, score }
  })
  return scored.sort((x, y) => y.score - x.score).slice(0, limit).map(x => x.s)
}
