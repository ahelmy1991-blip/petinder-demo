import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, nextId, notify, publicUser, Booking, COMMISSION_RATES } from '@/lib/db'

function enrich(b: Booking) {
  const service = db.services.get(b.serviceId)
  const owner = db.users.get(b.ownerId)
  const provider = db.users.get(b.providerId)
  const pet = db.pets.get(b.petId)
  return {
    ...b,
    service: service ?? null,
    owner: owner ? publicUser(owner) : null,
    provider: provider ? publicUser(provider) : null,
    pet: pet ?? null,
  }
}

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const bookings = [...db.bookings.values()]
    .filter(b => (user.role === 'provider' ? b.providerId === user.id : b.ownerId === user.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(enrich)
  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { serviceId, petId, date } = await req.json()
  const service = db.services.get(serviceId)
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  const pet = db.pets.get(petId)
  if (!pet || pet.ownerId !== user.id) {
    return NextResponse.json({ error: 'Select one of your own pets' }, { status: 400 })
  }
  if (!date || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: 'A valid date is required' }, { status: 400 })
  }
  if (Date.parse(date) < Date.now() - 86400e3) {
    return NextResponse.json({ error: 'Date cannot be in the past' }, { status: 400 })
  }
  const booking: Booking = {
    id: nextId('bkg'),
    ownerId: user.id,
    providerId: service.providerId,
    serviceId: service.id,
    petId: pet.id,
    date,
    status: 'pending',
    price: service.price,
    commission: Math.round(service.price * COMMISSION_RATES[service.type]),
    createdAt: new Date().toISOString(),
  }
  db.bookings.set(booking.id, booking)
  notify(service.providerId, `📅 New booking request: ${service.title} for ${pet.name}`)
  return NextResponse.json({ booking: enrich(booking) }, { status: 201 })
}
