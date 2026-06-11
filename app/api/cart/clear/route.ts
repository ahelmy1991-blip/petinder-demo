import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { clearCart } from '@/lib/store'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  clearCart(user.userId)
  return NextResponse.json({ success: true })
}
