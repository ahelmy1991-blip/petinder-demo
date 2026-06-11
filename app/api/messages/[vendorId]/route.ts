import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getMessages, addMessage } from '@/lib/store'
import { getVendorById } from '@/lib/vendors'

function getUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  return token ? verifyToken(token) : null
}

const AUTO_REPLIES_EN = [
  "Ahlan wa sahlan! 👋 Thanks for reaching out. How can we help you today?",
  "Great choice! We'll get that ready for you. Do you have any special requests?",
  "Shukran for your message! Our team will confirm your order shortly. Estimated time: 30-45 min 🚗",
  "Marhaba! We're currently busy but will respond within a few minutes. In the meantime, feel free to check our menu!",
  "Thank you! We have that available. Would you like to add anything else to your order?",
  "Tayeb! We noted your request. Our driver will be on the way soon 🛵",
]

const AUTO_REPLIES_AR = [
  "أهلاً وسهلاً! 👋 شكراً للتواصل معنا. كيف يمكننا مساعدتك اليوم؟",
  "اختيار رائع! سنجهّز طلبك. هل لديك أي طلبات خاصة؟",
  "شكراً على رسالتك! سيقوم فريقنا بتأكيد طلبك قريباً. الوقت المتوقع: ٣٠-٤٥ دقيقة 🚗",
  "مرحباً! نحن مشغولون قليلاً لكننا سنردّ خلال دقائق. تفضّل بمراجعة قائمتنا!",
  "تمام! استلمنا طلبك. سيصلك السائق قريباً 🛵",
  "طيب! لاحظنا طلبك. هل تريد إضافة أي شيء آخر؟",
]

export async function GET(req: NextRequest, { params }: { params: Promise<{ vendorId: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { vendorId } = await params
  return NextResponse.json(getMessages(user.userId, vendorId))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ vendorId: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { vendorId } = await params
  const { text } = await req.json()

  if (!text?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const vendor = getVendorById(vendorId)
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const userMsg = addMessage({ userId: user.userId, vendorId, senderId: user.userId, senderType: 'user', text: text.trim() })

  // Auto-reply from vendor after short delay simulation
  const lang = req.headers.get('x-lang') || 'en'
  const replies = lang === 'ar' ? AUTO_REPLIES_AR : AUTO_REPLIES_EN
  const replyText = replies[Math.floor(Math.random() * replies.length)]
  const vendorMsg = addMessage({ userId: user.userId, vendorId, senderId: vendorId, senderType: 'vendor', text: replyText })

  return NextResponse.json({ userMsg, vendorMsg }, { status: 201 })
}
