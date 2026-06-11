import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { healthInsights } from '@/lib/ai'
import { db, publicUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const { symptoms } = await req.json()
  if (!symptoms?.trim()) {
    return NextResponse.json({ error: 'Describe the symptoms' }, { status: 400 })
  }
  const insights = healthInsights(String(symptoms))
  const suggestVet = insights.some(i => i.suggestVet)
  const vets = suggestVet
    ? [...db.services.values()]
        .filter(s => s.type === 'vet')
        .map(s => ({ ...s, provider: db.users.get(s.providerId) ? publicUser(db.users.get(s.providerId)!) : null }))
    : []
  return NextResponse.json({ insights, suggestVet, vets })
}
