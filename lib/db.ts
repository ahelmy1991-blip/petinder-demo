/**
 * Petinder in-memory database (MVP).
 * Production target: Postgres + Prisma — see docs/DATABASE_SCHEMA.md.
 * All stores live on globalThis so they survive Next.js dev hot-reloads;
 * they reset on server restart.
 */
import { hashPassword } from './auth'

// ---------- Types ----------

export type Role = 'owner' | 'provider' | 'admin'
export type ProviderType = 'walker' | 'sitter' | 'vet' | 'groomer' | 'shop' | 'hotel'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  avatar: string // emoji avatar for MVP
  banned: boolean
  walletBalance: number
  createdAt: string
}

export interface ProviderProfile {
  userId: string
  type: ProviderType
  bio: string
  city: string
  verified: boolean
  rating: number
  reviewCount: number
  earnings: number
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'other'
  breed: string
  age: number
  gender: 'male' | 'female'
  size: 'small' | 'medium' | 'large'
  temperament: string[]
  medical: string
  bio: string
  photo: string // emoji for MVP
  adoptable: boolean
  followers: string[] // userIds
}

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  petId: string
  content: string
  photo: string
  likes: string[] // userIds
  comments: Comment[]
  createdAt: string
}

export interface Service {
  id: string
  providerId: string // userId of provider
  type: ProviderType
  title: string
  description: string
  price: number
  durationMin: number
  homeVisit?: boolean // provider comes to the customer's home
}

export interface PetEvent {
  id: string
  title: string
  description: string
  category: 'meetup' | 'adoption' | 'show' | 'training' | 'charity'
  city: string
  venue: string
  date: string // ISO
  organizerId: string // userId
  attendees: string[] // userIds RSVPed
  petFriendlySpecies: string[]
  photo: string
}

export interface Booking {
  id: string
  ownerId: string
  providerId: string
  serviceId: string
  petId: string
  date: string
  status: BookingStatus
  price: number
  commission: number // platform cut
  createdAt: string
}

export interface Product {
  id: string
  vendorId: string // userId of shop provider
  name: string
  category: string
  price: number
  photo: string
  stock: number
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  commission: number
  status: 'placed' | 'shipped' | 'delivered'
  createdAt: string
}

export interface Message {
  id: string
  fromId: string
  toId: string
  text: string
  createdAt: string
}

export interface Review {
  id: string
  targetUserId: string
  authorId: string
  rating: number
  text: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  text: string
  read: boolean
  createdAt: string
}

export type MatchMode = 'walk' | 'adoption' | 'breed'

export interface MatchRecord {
  id: string
  petAId: string
  petBId: string
  purpose: MatchMode
  createdAt: string
}

// ---------- Stores ----------

interface Db {
  users: Map<string, User>
  providerProfiles: Map<string, ProviderProfile>
  pets: Map<string, Pet>
  posts: Map<string, Post>
  services: Map<string, Service>
  bookings: Map<string, Booking>
  events: Map<string, PetEvent>
  products: Map<string, Product>
  cart: Map<string, CartItem>
  orders: Map<string, Order>
  messages: Message[]
  reviews: Review[]
  notifications: Notification[]
  matches: MatchRecord[]
  likesGiven: Map<string, Set<string>> // userId -> petIds swiped right
  seq: number
}

function createDb(): Db {
  return {
    users: new Map(),
    providerProfiles: new Map(),
    pets: new Map(),
    posts: new Map(),
    services: new Map(),
    bookings: new Map(),
    events: new Map(),
    products: new Map(),
    cart: new Map(),
    orders: new Map(),
    messages: [],
    reviews: [],
    notifications: [],
    matches: [],
    likesGiven: new Map(),
    seq: 1000,
  }
}

const g = globalThis as unknown as { __petinderDb?: Db }
export const db: Db = g.__petinderDb ?? (g.__petinderDb = seed(createDb()))

export function nextId(prefix: string): string {
  return `${prefix}_${++db.seq}`
}

// ---------- User helpers ----------

export function findUserByEmail(email: string): User | undefined {
  return [...db.users.values()].find(u => u.email.toLowerCase() === email.toLowerCase())
}
export function findUserById(id: string): User | undefined {
  return db.users.get(id)
}
export function createUser(data: { name: string; email: string; passwordHash: string; role: Role }): User {
  const user: User = {
    id: nextId('usr'),
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role,
    avatar: data.role === 'provider' ? '🧑‍⚕️' : '🙂',
    banned: false,
    walletBalance: 0,
    createdAt: new Date().toISOString(),
  }
  db.users.set(user.id, user)
  return user
}

export function publicUser(u: User) {
  const { passwordHash: _ph, ...rest } = u
  return rest
}

// ---------- Notifications ----------

export function notify(userId: string, text: string) {
  db.notifications.unshift({
    id: nextId('ntf'),
    userId,
    text,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

// ---------- Messaging ----------

/** Append a direct message between two users. */
export function sendMessage(fromId: string, toId: string, text: string): Message {
  const msg: Message = {
    id: nextId('msg'),
    fromId,
    toId,
    text: text.slice(0, 2000),
    createdAt: new Date().toISOString(),
  }
  db.messages.push(msg)
  return msg
}

/** True if any direct message already exists between the two users. */
export function conversationExists(a: string, b: string): boolean {
  return db.messages.some(
    m => (m.fromId === a && m.toId === b) || (m.fromId === b && m.toId === a),
  )
}

// ---------- Commission ----------

export const COMMISSION_RATES: Record<ProviderType, number> = {
  walker: 0.2,
  sitter: 0.2,
  groomer: 0.18,
  vet: 0.1,
  shop: 0.12,
  hotel: 0.15,
}

// ---------- Seed ----------

function seed(d: Db): Db {
  const pw = hashPassword('petinder123')
  const mk = (id: string, name: string, email: string, role: Role, avatar: string): User => {
    const u: User = {
      id, name, email, passwordHash: pw, role, avatar,
      banned: false, walletBalance: 0, createdAt: new Date().toISOString(),
    }
    d.users.set(id, u)
    return u
  }

  // Admin
  mk('usr_admin', 'Petinder Admin', 'admin@petinder.app', 'admin', '🛡️')

  // Providers
  mk('usr_walker1', 'Omar Walks', 'omar@petinder.app', 'provider', '🚶')
  mk('usr_sitter1', 'Laila Sits', 'laila@petinder.app', 'provider', '🏠')
  mk('usr_vet1', 'Dr. Nour Vet Clinic', 'nour@petinder.app', 'provider', '🩺')
  mk('usr_groomer1', 'Fluffy Cuts', 'fluffy@petinder.app', 'provider', '✂️')
  mk('usr_shop1', 'Pawsome Store', 'shop@petinder.app', 'provider', '🏪')

  const profiles: ProviderProfile[] = [
    { userId: 'usr_walker1', type: 'walker', bio: 'Daily dog walks, GPS-tracked routes, 5 yrs experience.', city: 'Cairo', verified: true, rating: 4.9, reviewCount: 132, earnings: 0 },
    { userId: 'usr_sitter1', type: 'sitter', bio: 'Overnight boarding in a pet-proofed home with garden.', city: 'Giza', verified: true, rating: 4.8, reviewCount: 87, earnings: 0 },
    { userId: 'usr_vet1', type: 'vet', bio: 'Licensed clinic — vaccinations, checkups, surgery.', city: 'Cairo', verified: true, rating: 4.7, reviewCount: 210, earnings: 0 },
    { userId: 'usr_groomer1', type: 'groomer', bio: 'Full grooming: bath, cut, nails, teeth.', city: 'Cairo', verified: false, rating: 4.5, reviewCount: 44, earnings: 0 },
    { userId: 'usr_shop1', type: 'shop', bio: 'Food, toys & accessories. Same-day delivery.', city: 'Cairo', verified: true, rating: 4.6, reviewCount: 301, earnings: 0 },
  ]
  profiles.forEach(p => d.providerProfiles.set(p.userId, p))

  const services: Service[] = [
    { id: 'svc_1', providerId: 'usr_walker1', type: 'walker', title: '30-min Dog Walk', description: 'Neighbourhood walk with GPS tracking & photo updates.', price: 150, durationMin: 30 },
    { id: 'svc_2', providerId: 'usr_walker1', type: 'walker', title: '60-min Adventure Walk', description: 'Park visit, off-leash play in safe zone.', price: 250, durationMin: 60 },
    { id: 'svc_3', providerId: 'usr_sitter1', type: 'sitter', title: 'Overnight Boarding', description: 'Your pet stays in a loving home, daily updates.', price: 500, durationMin: 1440 },
    { id: 'svc_4', providerId: 'usr_vet1', type: 'vet', title: 'General Checkup', description: 'Full physical exam + consultation.', price: 400, durationMin: 30 },
    { id: 'svc_5', providerId: 'usr_vet1', type: 'vet', title: 'Vaccination Visit', description: 'Core vaccines with digital record.', price: 350, durationMin: 20 },
    { id: 'svc_6', providerId: 'usr_groomer1', type: 'groomer', title: 'Full Groom', description: 'Bath, haircut, nails, ear cleaning.', price: 450, durationMin: 90 },
  ]
  services.forEach(s => d.services.set(s.id, s))

  const products: Product[] = [
    { id: 'prd_1', vendorId: 'usr_shop1', name: 'Premium Dog Food 5kg', category: 'food', price: 850, photo: '🦴', stock: 40 },
    { id: 'prd_2', vendorId: 'usr_shop1', name: 'Cat Scratching Tower', category: 'toys', price: 1200, photo: '🐈', stock: 12 },
    { id: 'prd_3', vendorId: 'usr_shop1', name: 'Adjustable Leash', category: 'accessories', price: 220, photo: '🦮', stock: 65 },
    { id: 'prd_4', vendorId: 'usr_shop1', name: 'Squeaky Ball 3-pack', category: 'toys', price: 120, photo: '🎾', stock: 100 },
    { id: 'prd_5', vendorId: 'usr_shop1', name: 'Pet Carrier (Medium)', category: 'accessories', price: 950, photo: '🧳', stock: 8 },
    { id: 'prd_6', vendorId: 'usr_shop1', name: 'Salmon Cat Treats', category: 'food', price: 95, photo: '🐟', stock: 200 },
  ]
  products.forEach(p => d.products.set(p.id, p))

  // Demo owners + pets + posts so feed/matching aren't empty
  mk('usr_demo1', 'Sara Hassan', 'sara@petinder.app', 'owner', '👩')
  mk('usr_demo2', 'Karim Adel', 'karim@petinder.app', 'owner', '👨')

  const pets: Pet[] = [
    { id: 'pet_1', ownerId: 'usr_demo1', name: 'Luna', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'female', size: 'large', temperament: ['friendly', 'energetic'], medical: 'Vaccinated, spayed', bio: 'Ball-obsessed goodest girl.', photo: '🐕', adoptable: false, followers: [] },
    { id: 'pet_2', ownerId: 'usr_demo1', name: 'Biscuit', species: 'cat', breed: 'Egyptian Mau', age: 2, gender: 'male', size: 'small', temperament: ['calm', 'independent'], medical: 'Vaccinated', bio: 'Professional sunbeam finder.', photo: '🐈', adoptable: false, followers: [] },
    { id: 'pet_3', ownerId: 'usr_demo2', name: 'Rocky', species: 'dog', breed: 'German Shepherd', age: 4, gender: 'male', size: 'large', temperament: ['loyal', 'protective', 'energetic'], medical: 'Vaccinated', bio: 'Park patrol captain.', photo: '🐕‍🦺', adoptable: false, followers: [] },
    { id: 'pet_4', ownerId: 'usr_demo2', name: 'Mimi', species: 'cat', breed: 'Persian', age: 1, gender: 'female', size: 'small', temperament: ['playful', 'cuddly'], medical: 'Vaccinated, weekly grooming', bio: 'Looking for a forever home! 🏡', photo: '🐱', adoptable: true, followers: [] },
    { id: 'pet_5', ownerId: 'usr_demo1', name: 'Coco', species: 'bird', breed: 'Cockatiel', age: 1, gender: 'female', size: 'small', temperament: ['vocal', 'playful'], medical: 'Healthy', bio: 'Sings better than you.', photo: '🦜', adoptable: false, followers: [] },
  ]
  pets.forEach(p => d.pets.set(p.id, p))

  const posts: Post[] = [
    { id: 'post_1', authorId: 'usr_demo1', petId: 'pet_1', content: 'Luna conquered the big slide at the park today! 🛝', photo: '🐕', likes: ['usr_demo2'], comments: [{ id: 'cmt_1', authorId: 'usr_demo2', text: 'Rocky wants a playdate!', createdAt: new Date().toISOString() }], createdAt: new Date(Date.now() - 3600e3).toISOString() },
    { id: 'post_2', authorId: 'usr_demo2', petId: 'pet_3', content: 'Rocky graduated obedience school 🎓 Proud dad moment.', photo: '🐕‍🦺', likes: ['usr_demo1'], comments: [], createdAt: new Date(Date.now() - 7200e3).toISOString() },
    { id: 'post_3', authorId: 'usr_demo2', petId: 'pet_4', content: 'Mimi is looking for her forever home — she is the sweetest. DM me! 💕', photo: '🐱', likes: [], comments: [], createdAt: new Date(Date.now() - 10800e3).toISOString() },
  ]
  posts.forEach(p => d.posts.set(p.id, p))

  const inDays = (n: number) => new Date(Date.now() + n * 86400e3).toISOString()
  const events: PetEvent[] = [
    { id: 'evt_1', title: 'Cairo Dog Park Meetup', description: 'Weekly off-leash social hour at Al-Azhar Park. All friendly dogs welcome — water stations and waste bags provided.', category: 'meetup', city: 'Cairo', venue: 'Al-Azhar Park', date: inDays(3), organizerId: 'usr_walker1', attendees: ['usr_demo1', 'usr_demo2'], petFriendlySpecies: ['dog'], photo: '🐕' },
    { id: 'evt_2', title: 'Adopt Don\'t Shop Day', description: 'Meet 30+ rescued cats and dogs looking for forever homes. Adoption fees waived, vet on-site for free checks.', category: 'adoption', city: 'Giza', venue: 'Giza Pet Rescue Center', date: inDays(7), organizerId: 'usr_vet1', attendees: ['usr_demo1'], petFriendlySpecies: ['dog', 'cat'], photo: '🏡' },
  ]
  events.forEach(e => d.events.set(e.id, e))

  return d
}
