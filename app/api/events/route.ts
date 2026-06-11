import { NextRequest, NextResponse } from 'next/server'
import { db, findUserById, notify } from '@/lib/db'
import { getSessionUser, unauthorized } from '@/lib/session'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  const city = req.nextUrl.searchParams.get('city')
  const now = Date.now()
  const events = [...db.events.values()]
    .filter(e => new Date(e.date).getTime() > now - 86400e3)
    .filter(e => !city || e.city.toLowerCase() === city.toLowerCase())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => {
      const organizer = findUserById(e.organizerId)
      return {
        ...e,
        organizer: organizer ? { id: organizer.id, name: organizer.name, avatar: organizer.avatar } : null,
        attendeeCount: e.attendees.length,
        going: e.attendees.includes(user.id),
      }
    })

  return NextResponse.json({ events })
}

// POST { eventId } toggles RSVP
export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()

  const body = (await req.json()) as { eventId?: string }
  const event = body.eventId ? db.events.get(body.eventId) : undefined
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const idx = event.attendees.indexOf(user.id)
  if (idx >= 0) {
    event.attendees.splice(idx, 1)
  } else {
    event.attendees.push(user.id)
    if (event.organizerId !== user.id) {
      notify(event.organizerId, `🎪 ${user.name} is going to "${event.title}"`)
    }
  }

  return NextResponse.json({ going: idx < 0, attendeeCount: event.attendees.length })
}
