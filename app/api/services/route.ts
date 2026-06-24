import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, unauthorized } from '@/lib/session'
import { db, publicUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionUser(req)
  if (!user) return unauthorized()
  const type = req.nextUrl.searchParams.get('type')
  const homeVisit = req.nextUrl.searchParams.get('homeVisit')
  const services = [...db.services.values()]
    .filter(s => (type ? s.type === type : true))
    .filter(s => (homeVisit ? s.homeVisit === true : true))
    .map(s => {
      const provider = db.users.get(s.providerId)
      const profile = db.providerProfiles.get(s.providerId)
      return { ...s, provider: provider ? publicUser(provider) : null, profile: profile ?? null }
    })
  return NextResponse.json({ services })
}
