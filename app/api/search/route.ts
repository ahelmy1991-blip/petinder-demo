import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  const type = req.nextUrl.searchParams.get('type') ?? 'all'

  // Return empty results if query is too short
  if (q.length < 2) {
    return NextResponse.json({ pets: [], services: [], providers: [], query: q })
  }

  const lower = q.toLowerCase()

  // --- Pets ---
  const pets =
    type === 'all' || type === 'pets'
      ? [...db.pets.values()]
          .filter(
            p =>
              p.name.toLowerCase().includes(lower) ||
              p.breed.toLowerCase().includes(lower),
          )
          .slice(0, 10)
      : []

  // --- Services ---
  const services =
    type === 'all' || type === 'services'
      ? [...db.services.values()]
          .filter(
            s =>
              s.title.toLowerCase().includes(lower) ||
              s.description.toLowerCase().includes(lower) ||
              s.type.toLowerCase().includes(lower),
          )
          .slice(0, 10)
          .map(s => {
            const provider = db.users.get(s.providerId)
            const profile = db.providerProfiles.get(s.providerId)
            return {
              ...s,
              provider: provider ? publicUser(provider) : null,
              profile: profile ?? null,
            }
          })
      : []

  // --- Providers ---
  const providers =
    type === 'all' || type === 'providers'
      ? [...db.users.values()]
          .filter(u => {
            if (u.role !== 'provider') return false
            const profile = db.providerProfiles.get(u.id)
            return (
              u.name.toLowerCase().includes(lower) ||
              (profile?.bio ?? '').toLowerCase().includes(lower) ||
              (profile?.city ?? '').toLowerCase().includes(lower) ||
              (profile?.type ?? '').toLowerCase().includes(lower)
            )
          })
          .slice(0, 10)
          .map(u => {
            const profile = db.providerProfiles.get(u.id)
            return { ...publicUser(u), providerProfile: profile ?? null }
          })
      : []

  return NextResponse.json({ pets, services, providers, query: q })
}
