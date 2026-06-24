/**
 * Petinder AI features (MVP — deterministic heuristics).
 * Production: swap each function for a Claude API call; the interfaces stay stable.
 */
import { db, MatchMode, Pet, Product, Service } from './db'

// ---------- Bio generation ----------

export interface BioInput {
  name?: string
  species?: string
  breed?: string
  age?: number
  gender?: 'male' | 'female'
  size?: string
  temperament?: string[]
  adoptable?: boolean
}

const SPECIES_NOUN: Record<string, string> = {
  dog: 'pup', cat: 'cat', bird: 'birdie', other: 'companion',
}
const TRAIT_PHRASES: Record<string, string> = {
  friendly: 'makes friends everywhere',
  energetic: 'has energy for days',
  playful: 'is always up for a game',
  calm: 'brings a calm, gentle presence',
  loyal: 'is fiercely loyal',
  protective: 'is a devoted little guardian',
  independent: 'enjoys a bit of independence',
  cuddly: 'lives for cuddles',
  vocal: 'always has something to say',
  curious: 'is endlessly curious',
  intelligent: 'is sharp as a tack',
  affectionate: 'is wonderfully affectionate',
  gentle: 'is as gentle as they come',
  social: 'loves being around people and pets',
}

/** Deterministically craft a warm pet bio from its attributes. */
export function generatePetBio(input: BioInput): string {
  const name = (input.name || '').trim() || 'This little one'
  const species = (input.species || 'dog').toLowerCase()
  const breed = (input.breed || '').trim()
  const noun = SPECIES_NOUN[species] ?? 'companion'
  const age = typeof input.age === 'number' && input.age >= 0 ? input.age : undefined
  const pronoun = input.gender === 'female' ? 'She' : input.gender === 'male' ? 'He' : 'They'
  const possessive = input.gender === 'female' ? 'her' : input.gender === 'male' ? 'his' : 'their'

  const agePart = age !== undefined
    ? age < 1 ? 'a tiny baby' : age === 1 ? 'a sprightly 1-year-old' : `a lovely ${age}-year-old`
    : ''
  const breedPart = breed ? `${breed} ` : ''
  const opener = agePart
    ? `Meet ${name} — ${agePart} ${breedPart}${noun}`.trim()
    : `Meet ${name}, a ${breedPart}${noun}`.trim()

  const traits = (input.temperament ?? []).map(t => t.toLowerCase().trim()).filter(Boolean)
  const traitPhrases = traits.map(t => TRAIT_PHRASES[t]).filter(Boolean) as string[]
  let traitSentence = ''
  if (traitPhrases.length === 1) traitSentence = `${pronoun} ${traitPhrases[0]}.`
  else if (traitPhrases.length >= 2) {
    const [first, second] = traitPhrases
    traitSentence = `${pronoun} ${first} and ${second}.`
  } else if (traits.length) {
    traitSentence = `${pronoun} is ${traits.slice(0, 2).join(' and ')}.`
  }

  const closer = input.adoptable
    ? `${name} is looking for a loving forever home — could it be yours? 🏡`
    : `${pronoun} would love to make new furry friends on Petinder! 🐾`

  return [`${opener}.`, traitSentence, closer].filter(Boolean).join(' ')
}

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

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/**
 * Score compatibility between pet `a` (the viewer's) and pet `b` (a candidate),
 * tailored to the match mode:
 *   walk     — fun walks & playdates (temperament/size/energy fit)
 *   adoption — how well candidate b would fit a's household
 *   breed    — breeding compatibility (same species, opposite sex, same breed)
 */
export function matchScore(a: Pet, b: Pet, mode: MatchMode = 'walk'): MatchScore {
  if (mode === 'breed') return breedScore(a, b)
  if (mode === 'adoption') return adoptionScore(a, b)
  return walkScore(a, b)
}

function walkScore(a: Pet, b: Pet): MatchScore {
  let score = 50
  const reasons: string[] = []

  if (a.species === b.species) {
    score += 20
    reasons.push(`Both are ${a.species}s — easy playdates`)
  } else {
    score -= 25
    reasons.push('Different species — supervised intros recommended')
  }

  if (a.size === b.size) {
    score += 10
    reasons.push('Similar size — safe rough-and-tumble')
  } else if ((a.size === 'large' && b.size === 'small') || (a.size === 'small' && b.size === 'large')) {
    score -= 10
    reasons.push('Big size gap — watch the rough play')
  }

  const affinity = a.temperament.filter(t =>
    b.temperament.some(bt => (TEMPERAMENT_AFFINITY[t] ?? [t]).includes(bt))
  )
  score += Math.min(20, affinity.length * 8)
  if (affinity.length) reasons.push(`Great walk energy: ${affinity.join(', ')}`)

  if (Math.abs(a.age - b.age) <= 2) {
    score += 5
    reasons.push('Close in age — matched pace')
  }

  return { score: clamp(score), reasons }
}

function adoptionScore(a: Pet, b: Pet): MatchScore {
  let score = 55
  const reasons: string[] = []

  if (a.species === b.species) {
    score += 18
    reasons.push(`Another ${b.species} — fits your home`)
  } else {
    score += 4
    reasons.push(`A ${b.species} would add variety to your family`)
  }

  if (a.size === b.size) {
    score += 8
    reasons.push('Similar size to your pet')
  }

  const affinity = a.temperament.filter(t =>
    b.temperament.some(bt => (TEMPERAMENT_AFFINITY[t] ?? [t]).includes(bt))
  )
  score += Math.min(18, affinity.length * 7)
  if (affinity.length) reasons.push(`Temperament clicks with ${a.name}: ${affinity.join(', ')}`)

  if (b.age <= 1) { score += 6; reasons.push('Young — lots of bonding years ahead') }
  reasons.push(`${b.name} is ready for a forever home 🏡`)

  return { score: clamp(score), reasons }
}

function breedScore(a: Pet, b: Pet): MatchScore {
  let score = 40
  const reasons: string[] = []

  if (a.species !== b.species) {
    return { score: 0, reasons: ['Different species — not a breeding match'] }
  }
  score += 15
  reasons.push(`Both ${a.species}s`)

  if (a.gender !== b.gender) {
    score += 30
    reasons.push('Opposite sex — breeding compatible 💞')
  } else {
    score -= 35
    reasons.push('Same sex — not suitable for breeding')
  }

  if (a.breed && b.breed && a.breed.toLowerCase() === b.breed.toLowerCase()) {
    score += 25
    reasons.push(`Same breed — purebred ${a.breed} litter`)
  } else {
    score += 5
    reasons.push('Mixed breed pairing')
  }

  const bothAdult = a.age >= 1 && b.age >= 1 && a.age <= 8 && b.age <= 8
  if (bothAdult) {
    score += 10
    reasons.push('Both at a healthy breeding age')
  }

  if (a.size === b.size) {
    score += 5
    reasons.push('Matched size — safer breeding')
  }

  return { score: clamp(score), reasons }
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
    case 'hotel':
      return ['I\'m traveling next week — any suites free?', 'Can you send daily videos while I\'m away?', 'Do you offer airport pickup for my pet?']
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
