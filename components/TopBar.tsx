'use client'

import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

interface Props {
  userName?: string
  onLogout?: () => void
}

export default function TopBar({ userName, onLogout }: Props) {
  const { lang, toggle } = useLang()
  const tr = t[lang]

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div>
        <span className="text-xl font-black text-rose-600">{tr.appName}</span>
        {userName && (
          <p className="text-xs text-gray-400">{tr.hi}, {userName.split(' ')[0]} 👋</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="text-xs font-bold px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          {lang === 'en' ? 'عربي' : 'EN'}
        </button>
        {onLogout && (
          <button onClick={onLogout} className="text-xs text-gray-400 hover:text-gray-700">
            {tr.signOut}
          </button>
        )}
      </div>
    </header>
  )
}
