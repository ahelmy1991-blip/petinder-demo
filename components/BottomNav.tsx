'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

interface Props {
  cartCount?: number
}

export default function BottomNav({ cartCount = 0 }: Props) {
  const pathname = usePathname()
  const { lang } = useLang()
  const tr = t[lang]

  const items = [
    { href: '/home', label: tr.home, icon: '🏠' },
    { href: '/saved', label: tr.saved, icon: '❤️' },
    { href: '/cart', label: tr.cart, icon: '🛒', badge: cartCount },
    { href: '/chat', label: tr.chat, icon: '💬' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40 safe-area-pb">
      {items.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors relative ${active ? 'text-rose-500' : 'text-gray-400'}`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1/4 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
