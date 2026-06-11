import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { updateCartItem, removeCartItem } from '@/lib/store'

function getUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  return token ? verifyToken(token) : null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params
  const { quantity } = await req.json()
  const updated = updateCartItem(itemId, quantity)
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params
  removeCartItem(itemId)
  return NextResponse.json({ success: true })
}
