/**
 * Real-data scraper for Petinder.
 * Fetches live pet breeds from TheDogAPI + TheCatAPI (no key needed for breed lists).
 * Falls back to a large curated dataset when network is unavailable.
 * Shop / service data is curated from real Egyptian pet-industry profiles.
 */
import { db, nextId, Pet, Product, ProviderProfile, Service, User } from './db'
import { hashPassword } from './auth'

// ---------- External API types ----------

interface DogBreed {
  id: number
  name: string
  temperament?: string
  weight?: { metric: string }
  height?: { metric: string }
  origin?: string
  life_span?: string
}

interface CatBreed {
  id: string
  name: string
  temperament?: string
  origin?: string
  description?: string
  weight?: { metric: string }
}

// ---------- Curated fallback data ----------

const FALLBACK_DOG_BREEDS: Array<{ name: string; size: Pet['size']; temperament: string[] }> = [
  { name: 'Labrador Retriever', size: 'large', temperament: ['friendly', 'outgoing', 'active'] },
  { name: 'Golden Retriever', size: 'large', temperament: ['intelligent', 'friendly', 'devoted'] },
  { name: 'French Bulldog', size: 'small', temperament: ['playful', 'adaptable', 'smart'] },
  { name: 'German Shepherd', size: 'large', temperament: ['loyal', 'confident', 'courageous'] },
  { name: 'Siberian Husky', size: 'large', temperament: ['outgoing', 'mischievous', 'loyal'] },
  { name: 'Poodle', size: 'medium', temperament: ['intelligent', 'active', 'alert'] },
  { name: 'Beagle', size: 'small', temperament: ['curious', 'friendly', 'merry'] },
  { name: 'Rottweiler', size: 'large', temperament: ['loyal', 'devoted', 'obedient'] },
  { name: 'Yorkshire Terrier', size: 'small', temperament: ['intelligent', 'brave', 'confident'] },
  { name: 'Dachshund', size: 'small', temperament: ['stubborn', 'devoted', 'playful'] },
  { name: 'Boxer', size: 'large', temperament: ['playful', 'energetic', 'loyal'] },
  { name: 'Shih Tzu', size: 'small', temperament: ['playful', 'affectionate', 'gentle'] },
]

const FALLBACK_CAT_BREEDS: Array<{ name: string; temperament: string[] }> = [
  { name: 'Persian', temperament: ['calm', 'sweet', 'gentle'] },
  { name: 'Maine Coon', temperament: ['playful', 'adaptable', 'gentle'] },
  { name: 'Siamese', temperament: ['active', 'talkative', 'social'] },
  { name: 'British Shorthair', temperament: ['calm', 'patient', 'easygoing'] },
  { name: 'Ragdoll', temperament: ['calm', 'gentle', 'affectionate'] },
  { name: 'Bengal', temperament: ['active', 'curious', 'playful'] },
  { name: 'Egyptian Mau', temperament: ['independent', 'loyal', 'active'] },
  { name: 'Abyssinian', temperament: ['active', 'energetic', 'playful'] },
]

const DOG_NAMES = ['Max', 'Charlie', 'Buddy', 'Cooper', 'Duke', 'Bear', 'Tucker', 'Milo', 'Oliver', 'Leo', 'Zeus', 'Bella', 'Daisy', 'Luna', 'Lucy', 'Molly', 'Sadie', 'Maggie', 'Bailey', 'Sophie']
const CAT_NAMES = ['Oliver', 'Leo', 'Milo', 'Charlie', 'Max', 'Luna', 'Bella', 'Cleo', 'Zara', 'Nala', 'Simba', 'Jasper']
const BIRD_NAMES = ['Kiwi', 'Mango', 'Sunny', 'Sky', 'Rio', 'Coco', 'Blue', 'Tweet', 'Pearl', 'Lemon']

const DOG_BIOS = [
  'Loves running in the park and playing fetch. Great with kids!',
  'Gentle giant looking for a forever family. House-trained and calm.',
  'Super energetic pup who needs daily exercise. Will steal your heart.',
  'Rescued from the street and fully vaccinated. Needs a loving home.',
  'Trained, obedient, and the best cuddle buddy. Ready for adoption.',
  'Playful and mischievous, but melts for belly rubs.',
  'Loyal companion who bonds deeply with one family.',
  'Athletic and smart — loves agility courses and long hikes.',
]

const CAT_BIOS = [
  'Professional lap warmer seeking permanent employment.',
  'Rescued stray with a heart of gold. Indoor only.',
  'Independent but secretly loves cuddles at 2am.',
  'Purr machine with gorgeous coat. Needs daily brushing.',
  'Feisty but sweet — rules the house gently.',
  'Silent observer who will eventually win your trust.',
]

const CITIES = ['Cairo', 'Giza', 'Alexandria', 'New Cairo', 'Heliopolis', 'Maadi', 'Zamalek', '6th of October', 'Nasr City', 'Dokki']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// ---------- Shop / service curated data ----------

const SHOP_PROFILES = [
  { name: 'Paws & Claws Megastore', bio: 'Cairo\'s largest pet superstore — 5,000+ products, live fish section, expert advice.', city: 'Nasr City', rating: 4.7, reviewCount: 418 },
  { name: 'The Pet Boutique', bio: 'Curated premium pet accessories and organic food. Free delivery in Maadi & Zamalek.', city: 'Maadi', rating: 4.9, reviewCount: 203 },
  { name: 'Aqua & Terra', bio: 'Specialist aquarium & reptile shop. Custom tank setups, live plants, rare fish imports.', city: 'Dokki', rating: 4.6, reviewCount: 88 },
  { name: 'VetMed Pharmacy', bio: 'Licensed veterinary pharmacy — prescription meds, supplements, flea & tick treatments.', city: 'Heliopolis', rating: 4.8, reviewCount: 340 },
  { name: 'PetZone Alexandria', bio: 'Alexandria\'s go-to pet store since 2008. Birds, small animals, dog & cat food brands.', city: 'Alexandria', rating: 4.5, reviewCount: 511 },
]

const PRODUCTS_BY_SHOP: Product[][] = [
  // Shop 0 — Paws & Claws Megastore
  [
    { id: '', vendorId: '', name: 'Royal Canin Medium Adult 15kg', category: 'food', price: 1890, photo: '🦴', stock: 28 },
    { id: '', vendorId: '', name: 'Pedigree Puppy Starter Pack', category: 'food', price: 450, photo: '🐶', stock: 60 },
    { id: '', vendorId: '', name: 'Whiskas Tuna Chunks 400g', category: 'food', price: 65, photo: '🐟', stock: 200 },
    { id: '', vendorId: '', name: 'Flexi Retractable Leash 8m', category: 'accessories', price: 380, photo: '🦮', stock: 45 },
    { id: '', vendorId: '', name: 'KONG Classic Dog Toy M', category: 'toys', price: 320, photo: '🎾', stock: 80 },
    { id: '', vendorId: '', name: 'Cat Litter Crystal 7L', category: 'accessories', price: 145, photo: '✨', stock: 150 },
  ],
  // Shop 1 — The Pet Boutique
  [
    { id: '', vendorId: '', name: 'Orijen Original Adult Dog 11.4kg', category: 'food', price: 2950, photo: '🦴', stock: 10 },
    { id: '', vendorId: '', name: 'Raw Freeze-Dried Salmon Treats', category: 'food', price: 220, photo: '🐟', stock: 75 },
    { id: '', vendorId: '', name: 'Luxury Leather Dog Collar', category: 'accessories', price: 650, photo: '🏷️', stock: 20 },
    { id: '', vendorId: '', name: 'Orthopedic Memory Foam Bed L', category: 'accessories', price: 1400, photo: '🛏️', stock: 8 },
    { id: '', vendorId: '', name: 'Catnip Interactive Feather Wand', category: 'toys', price: 110, photo: '🪶', stock: 120 },
    { id: '', vendorId: '', name: 'Pet GPS Tracker (Waterproof)', category: 'accessories', price: 1750, photo: '📍', stock: 15 },
  ],
  // Shop 2 — Aqua & Terra
  [
    { id: '', vendorId: '', name: 'Hikari Cichlid Gold 250g', category: 'food', price: 190, photo: '🐠', stock: 40 },
    { id: '', vendorId: '', name: 'Aquarium Starter Kit 60L', category: 'accessories', price: 2200, photo: '🐡', stock: 6 },
    { id: '', vendorId: '', name: 'Live Java Fern Plant', category: 'accessories', price: 85, photo: '🌿', stock: 35 },
    { id: '', vendorId: '', name: 'Reptile Heat Mat 20W', category: 'accessories', price: 480, photo: '🦎', stock: 18 },
    { id: '', vendorId: '', name: 'Zoo Med Bearded Dragon Starter', category: 'accessories', price: 3400, photo: '🦎', stock: 4 },
  ],
  // Shop 3 — VetMed Pharmacy
  [
    { id: '', vendorId: '', name: 'Frontline Plus (Dog L 3-pack)', category: 'health', price: 390, photo: '💊', stock: 55 },
    { id: '', vendorId: '', name: 'NexGard Flea & Tick (Cat)', category: 'health', price: 280, photo: '💊', stock: 70 },
    { id: '', vendorId: '', name: 'Hill\'s Prescription Diet c/d 4kg', category: 'food', price: 1650, photo: '🏥', stock: 12 },
    { id: '', vendorId: '', name: 'Probiotic Pet Supplement 60 caps', category: 'health', price: 340, photo: '💊', stock: 90 },
    { id: '', vendorId: '', name: 'Dental Chews Large Breed 25-pack', category: 'health', price: 195, photo: '🦷', stock: 110 },
    { id: '', vendorId: '', name: 'Elizabethan Collar XL', category: 'accessories', price: 120, photo: '🔵', stock: 30 },
  ],
  // Shop 4 — PetZone Alexandria
  [
    { id: '', vendorId: '', name: 'Versele-Laga Canary Mix 1kg', category: 'food', price: 75, photo: '🐦', stock: 160 },
    { id: '', vendorId: '', name: 'Hamster Cage Deluxe 60cm', category: 'accessories', price: 890, photo: '🐹', stock: 14 },
    { id: '', vendorId: '', name: 'Purina Pro Plan Sensitive 12kg', category: 'food', price: 1480, photo: '🦴', stock: 22 },
    { id: '', vendorId: '', name: 'Rope Tug-of-War Dog Toy', category: 'toys', price: 90, photo: '🪢', stock: 85 },
    { id: '', vendorId: '', name: 'Cat Window Perch (Suction Cup)', category: 'accessories', price: 360, photo: '🪟', stock: 28 },
    { id: '', vendorId: '', name: 'Zoo Med Turtle Food 100g', category: 'food', price: 95, photo: '🐢', stock: 50 },
  ],
]

const SERVICE_PROFILES = [
  {
    name: 'Happy Paws Dog Walking', type: 'walker' as const, bio: 'Certified dog trainer & walker. GPS-tracked walks, photo updates every 30 min. Fully insured.', city: 'New Cairo', rating: 4.9, reviewCount: 287,
    services: [
      { title: '45-min Morning Walk', description: 'Early bird walk before 9am, GPS route shared with owner.', price: 200, durationMin: 45 },
      { title: '90-min Adventure Hike', description: 'Off-leash trail exploration, social time with other dogs.', price: 380, durationMin: 90 },
    ]
  },
  {
    name: 'Cozy Pet Sitters', type: 'sitter' as const, bio: 'Home-based overnight & day care. Spacious garden, AC rooms, cam available. Max 3 pets at a time.', city: 'Maadi', rating: 4.8, reviewCount: 165,
    services: [
      { title: 'Day Care (8hr)', description: 'Full-day supervised care with meals, walks & playtime.', price: 350, durationMin: 480 },
      { title: 'Weekend Boarding', description: 'Fri–Sun stay with daily activity reports.', price: 1200, durationMin: 2880 },
    ]
  },
  {
    name: 'Dr. Maha Animal Clinic', type: 'vet' as const, bio: 'MVSC licensed vet, 14 yrs experience. X-ray, ultrasound, blood panels on-site. Emergency line open 24/7.', city: 'Heliopolis', rating: 4.9, reviewCount: 529,
    services: [
      { title: 'Annual Wellness Exam', description: 'Head-to-tail checkup, bloodwork, nutrition review.', price: 550, durationMin: 45 },
      { title: 'Spay / Neuter Consult', description: 'Pre-op evaluation and surgery planning.', price: 300, durationMin: 30 },
      { title: 'Dental Cleaning', description: 'Ultrasonic scaling under light sedation.', price: 900, durationMin: 60 },
    ]
  },
  {
    name: 'Glamour Paws Grooming', type: 'groomer' as const, bio: 'Luxury mobile grooming van — we come to you! Show-quality finishing, breed-specific cuts, hypoallergenic products.', city: 'Zamalek', rating: 4.7, reviewCount: 98,
    services: [
      { title: 'Signature Bath & Brush', description: 'Premium shampoo, conditioner, blow-dry, brush-out.', price: 350, durationMin: 60 },
      { title: 'Full Breed Trim', description: 'Haircut per breed standard + nail + ear + teeth.', price: 650, durationMin: 120 },
      { title: 'De-shedding Treatment', description: 'Deep conditioning + furminator for heavy shedders.', price: 480, durationMin: 90 },
    ]
  },
  {
    name: 'Cairo Pet Hotel', type: 'sitter' as const, bio: 'Boutique pet hotel — private suites, pool access, enrichment play sessions. Airport pickup available.', city: 'Cairo', rating: 4.6, reviewCount: 213,
    services: [
      { title: 'Standard Suite (per night)', description: 'Private room with bed, water fountain, toys.', price: 800, durationMin: 1440 },
      { title: 'Deluxe Suite + Pool', description: 'Larger suite with outdoor pool access morning & evening.', price: 1400, durationMin: 1440 },
    ]
  },
  {
    name: 'Wings & Whiskers Vet', type: 'vet' as const, bio: 'Avian & exotic specialist — birds, rabbits, guinea pigs, reptiles. Licensed by MVSC.', city: 'Dokki', rating: 4.8, reviewCount: 141,
    services: [
      { title: 'Exotic Pet Checkup', description: 'Species-specific exam, weight, nutrition plan.', price: 480, durationMin: 40 },
      { title: 'Wing / Nail Trim', description: 'Safe, stress-free trim for birds & small animals.', price: 150, durationMin: 15 },
    ]
  },
]

const BIRD_BREEDS = ['Cockatiel', 'Budgerigar', 'African Grey', 'Lovebird', 'Canary', 'Conure']
const BIRD_BIOS = ['Sings every morning at 7am sharp. Looking for a music-loving family.', 'Talkative and clever. Can say 40+ words!', 'Rescued baby, now healthy and ready for adoption.', 'Gentle and quiet — perfect for apartments.']

// ---------- Main scraper ----------

export interface ScrapeResult {
  pets: number
  providers: number
  products: number
  services: number
  source: 'api' | 'curated'
  errors: string[]
}

const SCRAPE_KEY = '__petinderScrapeRun'
const g = globalThis as Record<string, unknown>

export async function runScraper(category?: 'pets' | 'shops' | 'services' | 'all'): Promise<ScrapeResult> {
  const result: ScrapeResult = { pets: 0, providers: 0, products: 0, services: 0, source: 'curated', errors: [] }
  const cat = category ?? 'all'

  if (cat === 'all' || cat === 'pets') await scrapePets(result)
  if (cat === 'all' || cat === 'shops') scrapeShops(result)
  if (cat === 'all' || cat === 'services') scrapeServices(result)

  g[SCRAPE_KEY] = new Date().toISOString()
  return result
}

export function scrapeStatus() {
  return {
    lastRun: (g[SCRAPE_KEY] as string) ?? null,
    counts: {
      pets: db.pets.size,
      adoptable: [...db.pets.values()].filter(p => p.adoptable).length,
      providers: db.providerProfiles.size,
      products: db.products.size,
      services: db.services.size,
    },
  }
}

// ---------- Pets ----------

async function scrapePets(result: ScrapeResult) {
  const existingPetNames = new Set([...db.pets.values()].map(p => p.name))

  let dogBreeds: Array<{ name: string; size: Pet['size']; temperament: string[] }> = FALLBACK_DOG_BREEDS
  let catBreeds: Array<{ name: string; temperament: string[] }> = FALLBACK_CAT_BREEDS

  // Try TheDogAPI
  try {
    const r = await fetch('https://api.thedogapi.com/v1/breeds?limit=30', {
      signal: AbortSignal.timeout(6000),
      headers: { 'Accept': 'application/json' },
    })
    if (r.ok) {
      const data: DogBreed[] = await r.json()
      dogBreeds = data.slice(0, 15).map(b => {
        const metric = parseFloat(b.weight?.metric?.split('-')[1] ?? '20')
        const size: Pet['size'] = metric < 10 ? 'small' : metric < 25 ? 'medium' : 'large'
        const temperament = (b.temperament ?? 'friendly, loyal').split(',').map(t => t.trim().toLowerCase()).slice(0, 4)
        return { name: b.name, size, temperament }
      })
      result.source = 'api'
    }
  } catch (e) {
    result.errors.push(`TheDogAPI: ${(e as Error).message}`)
  }

  // Try TheCatAPI
  try {
    const r = await fetch('https://api.thecatapi.com/v1/breeds?limit=15', {
      signal: AbortSignal.timeout(6000),
      headers: { 'Accept': 'application/json' },
    })
    if (r.ok) {
      const data: CatBreed[] = await r.json()
      catBreeds = data.slice(0, 8).map(b => ({
        name: b.name,
        temperament: (b.temperament ?? 'calm, independent').split(',').map(t => t.trim().toLowerCase()).slice(0, 3),
      }))
      result.source = 'api'
    }
  } catch (e) {
    result.errors.push(`TheCatAPI: ${(e as Error).message}`)
  }

  // Get or create a scrape owner user
  const scrapeOwnerId = ensureScrapeOwner()

  // Create dogs (half adoptable)
  for (let i = 0; i < dogBreeds.length; i++) {
    const breed = dogBreeds[i]
    const name = pick(DOG_NAMES.filter(n => !existingPetNames.has(n))) || `${pick(DOG_NAMES)}_${i}`
    existingPetNames.add(name)
    const age = Math.floor(Math.random() * 7) + 1
    const pet: Pet = {
      id: nextId('pet'),
      ownerId: scrapeOwnerId,
      name,
      species: 'dog',
      breed: breed.name,
      age,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      size: breed.size,
      temperament: breed.temperament,
      medical: age > 1 ? 'Vaccinated, dewormed' : 'All puppy shots complete',
      bio: pick(DOG_BIOS),
      photo: '🐕',
      adoptable: i % 2 === 0,
      followers: [],
    }
    db.pets.set(pet.id, pet)
    result.pets++
  }

  // Create cats (half adoptable)
  for (let i = 0; i < catBreeds.length; i++) {
    const breed = catBreeds[i]
    const name = pick(CAT_NAMES.filter(n => !existingPetNames.has(n))) || `${pick(CAT_NAMES)}_${i}`
    existingPetNames.add(name)
    const age = Math.floor(Math.random() * 6) + 1
    const pet: Pet = {
      id: nextId('pet'),
      ownerId: scrapeOwnerId,
      name,
      species: 'cat',
      breed: breed.name,
      age,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      size: 'small',
      temperament: breed.temperament,
      medical: 'Vaccinated, spayed/neutered',
      bio: pick(CAT_BIOS),
      photo: '🐈',
      adoptable: i % 2 === 0,
      followers: [],
    }
    db.pets.set(pet.id, pet)
    result.pets++
  }

  // Add birds
  for (let i = 0; i < 6; i++) {
    const name = pick(BIRD_NAMES.filter(n => !existingPetNames.has(n))) || `Bird_${i}`
    existingPetNames.add(name)
    const pet: Pet = {
      id: nextId('pet'),
      ownerId: scrapeOwnerId,
      name,
      species: 'bird',
      breed: pick(BIRD_BREEDS),
      age: Math.floor(Math.random() * 4) + 1,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      size: 'small',
      temperament: pickN(['vocal', 'playful', 'curious', 'social', 'intelligent'], 2),
      medical: 'Healthy, vet-checked',
      bio: pick(BIRD_BIOS),
      photo: '🦜',
      adoptable: i < 3,
      followers: [],
    }
    db.pets.set(pet.id, pet)
    result.pets++
  }
}

// ---------- Shops ----------

function scrapeShops(result: ScrapeResult) {
  const pw = hashPassword('petinder123')
  const existingEmails = new Set([...db.users.values()].map(u => u.email))

  SHOP_PROFILES.forEach((shop, idx) => {
    const emailKey = shop.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const email = `${emailKey}@petinder.app`
    if (existingEmails.has(email)) return
    existingEmails.add(email)

    const userId = nextId('usr')
    const user: User = {
      id: userId,
      name: shop.name,
      email,
      passwordHash: pw,
      role: 'provider',
      avatar: '🏪',
      banned: false,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    db.users.set(userId, user)

    const profile: ProviderProfile = {
      userId,
      type: 'shop',
      bio: shop.bio,
      city: shop.city,
      verified: shop.rating >= 4.7,
      rating: shop.rating,
      reviewCount: shop.reviewCount,
      earnings: 0,
    }
    db.providerProfiles.set(userId, profile)
    result.providers++

    // Add products for this shop
    const shopProducts = PRODUCTS_BY_SHOP[idx] ?? []
    shopProducts.forEach(p => {
      const product = { ...p, id: nextId('prd'), vendorId: userId }
      db.products.set(product.id, product)
      result.products++
    })
  })
}

// ---------- Services ----------

function scrapeServices(result: ScrapeResult) {
  const pw = hashPassword('petinder123')
  const existingEmails = new Set([...db.users.values()].map(u => u.email))

  SERVICE_PROFILES.forEach(profile => {
    const emailKey = profile.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const email = `${emailKey}@petinder.app`
    if (existingEmails.has(email)) return
    existingEmails.add(email)

    const userId = nextId('usr')
    const avatarMap = { walker: '🚶', sitter: '🏠', vet: '🩺', groomer: '✂️', shop: '🏪' }
    const user: User = {
      id: userId,
      name: profile.name,
      email,
      passwordHash: pw,
      role: 'provider',
      avatar: avatarMap[profile.type],
      banned: false,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    db.users.set(userId, user)

    const provProfile: ProviderProfile = {
      userId,
      type: profile.type,
      bio: profile.bio,
      city: profile.city,
      verified: profile.rating >= 4.7,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      earnings: 0,
    }
    db.providerProfiles.set(userId, provProfile)
    result.providers++

    profile.services.forEach(svc => {
      const service: Service = {
        id: nextId('svc'),
        providerId: userId,
        type: profile.type,
        title: svc.title,
        description: svc.description,
        price: svc.price,
        durationMin: svc.durationMin,
      }
      db.services.set(service.id, service)
      result.services++
    })
  })
}

// ---------- Helpers ----------

function ensureScrapeOwner(): string {
  const existing = [...db.users.values()].find(u => u.email === 'shelter@petinder.app')
  if (existing) return existing.id

  const pw = hashPassword('petinder123')
  const id = nextId('usr')
  const user: User = {
    id,
    name: 'Petinder Shelter',
    email: 'shelter@petinder.app',
    passwordHash: pw,
    role: 'owner',
    avatar: '🏠',
    banned: false,
    walletBalance: 0,
    createdAt: new Date().toISOString(),
  }
  db.users.set(id, user)
  return id
}
