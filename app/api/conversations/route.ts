import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getConversations } from '@/lib/store'
import { getVendorById } from '@/lib/vendors'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const convos = getConversations(user.userId).map(c => ({
    ...c,
    vendor: getVendorById(c.vendorId),
  }))
  return NextResponse.json(convos)
}
