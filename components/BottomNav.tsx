'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/feed', label: 'Feed', icon: '🏠' },
  { href: '/match', label: 'Match', icon: '💞' },
  { href: '/services', label: 'Services', icon: '🧰' },
  { href: '/events', label: 'Events', icon: '🎪' },
  { href: '/shop', label: 'Shop', icon: '🛍️' },
  { href: '/chat', label: 'Chat', icon: '💬' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(t => {
        const active = pathname === t.href || pathname.startsWith(t.href + '/')
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center text-[11px] font-medium px-2 ${active ? 'text-rose-500' : 'text-gray-400'}`}
          >
            <span className="text-xl leading-none mb-0.5">{t.icon}</span>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
