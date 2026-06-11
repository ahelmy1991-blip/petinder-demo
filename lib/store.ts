import { randomUUID } from 'crypto'

export interface CartItem {
  id: string
  userId: string
  vendorId: string
  vendorNameEn: string
  vendorNameAr: string
  productId: string
  productNameEn: string
  productNameAr: string
  productEmoji: string
  price: number
  quantity: number
}

export interface Message {
  id: string
  userId: string
  vendorId: string
  senderId: string
  senderType: 'user' | 'vendor'
  text: string
  timestamp: string
}

export interface SavedVendor {
  userId: string
  vendorId: string
  savedAt: string
}

// In-memory stores — reset on server restart (demo)
const cartItems = new Map<string, CartItem>()
const messages = new Map<string, Message>()
const savedVendors = new Map<string, SavedVendor>()

// ── Cart ──────────────────────────────────────────────
export function getCart(userId: string): CartItem[] {
  return Array.from(cartItems.values()).filter(i => i.userId === userId)
}

export function addToCart(item: Omit<CartItem, 'id'>): CartItem {
  // Merge with existing item if same product + vendor
  const existing = Array.from(cartItems.values()).find(
    i => i.userId === item.userId && i.vendorId === item.vendorId && i.productId === item.productId
  )
  if (existing) {
    const updated = { ...existing, quantity: existing.quantity + item.quantity }
    cartItems.set(existing.id, updated)
    return updated
  }
  const newItem: CartItem = { id: randomUUID(), ...item }
  cartItems.set(newItem.id, newItem)
  return newItem
}

export function updateCartItem(id: string, quantity: number): CartItem | null {
  const item = cartItems.get(id)
  if (!item) return null
  if (quantity <= 0) { cartItems.delete(id); return null }
  const updated = { ...item, quantity }
  cartItems.set(id, updated)
  return updated
}

export function removeCartItem(id: string): boolean {
  return cartItems.delete(id)
}

export function clearCart(userId: string): void {
  for (const [id, item] of cartItems.entries()) {
    if (item.userId === userId) cartItems.delete(id)
  }
}

// ── Messages ──────────────────────────────────────────
export function getMessages(userId: string, vendorId: string): Message[] {
  return Array.from(messages.values())
    .filter(m => m.userId === userId && m.vendorId === vendorId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function getConversations(userId: string): { vendorId: string; lastMessage: Message }[] {
  const byVendor = new Map<string, Message>()
  for (const msg of messages.values()) {
    if (msg.userId !== userId) continue
    const existing = byVendor.get(msg.vendorId)
    if (!existing || msg.timestamp > existing.timestamp) byVendor.set(msg.vendorId, msg)
  }
  return Array.from(byVendor.entries()).map(([vendorId, lastMessage]) => ({ vendorId, lastMessage }))
}

export function addMessage(msg: Omit<Message, 'id' | 'timestamp'>): Message {
  const newMsg: Message = { id: randomUUID(), ...msg, timestamp: new Date().toISOString() }
  messages.set(newMsg.id, newMsg)
  return newMsg
}

// ── Saved Vendors ─────────────────────────────────────
export function getSavedVendors(userId: string): string[] {
  return Array.from(savedVendors.values())
    .filter(s => s.userId === userId)
    .map(s => s.vendorId)
}

export function saveVendor(userId: string, vendorId: string): void {
  const key = `${userId}:${vendorId}`
  if (!savedVendors.has(key)) {
    savedVendors.set(key, { userId, vendorId, savedAt: new Date().toISOString() })
  }
}

export function unsaveVendor(userId: string, vendorId: string): void {
  savedVendors.delete(`${userId}:${vendorId}`)
}
