import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/home', '/vendors', '/cart', '/chat', '/saved', '/swipe', '/matches']
const AUTH_PAGES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/vendors/:path*', '/cart/:path*', '/chat/:path*', '/saved/:path*', '/swipe', '/matches', '/login', '/register'],
}
