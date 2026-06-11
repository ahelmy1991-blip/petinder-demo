import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getSavedVendors, saveVendor, unsaveVendor } from '@/lib/store'
import { getVendorById } from '@/lib/vendors'

function getUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  return token ? verifyToken(token) : null
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ids = getSavedVendors(user.userId)
  return NextResponse.json(ids.map(id => getVendorById(id)).filter(Boolean))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { vendorId, remove } = await req.json()
  if (remove) unsaveVendor(user.userId, vendorId)
  else saveVendor(user.userId, vendorId)
  return NextResponse.json({ success: true })
}
