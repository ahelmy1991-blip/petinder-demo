import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const notifications = db.notifications.filter(n => n.userId === user.id).slice(0, 50)
  return NextResponse.json({ notifications, unread: notifications.filter(n => !n.read).length })
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  db.notifications.forEach(n => {
    if (n.userId === user.id) n.read = true
  })
  return NextResponse.json({ ok: true })
}
