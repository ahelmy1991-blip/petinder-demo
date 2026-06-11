'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'

interface LangContextValue {
  lang: Lang
  toggle: () => void
  isRTL: boolean
}

const LangContext = createContext<LangContextValue>({ lang: 'en', toggle: () => {}, isRTL: false })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('cairo-lang') as Lang | null
    if (stored) setLang(stored)
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    localStorage.setItem('cairo-lang', next)
  }

  return (
    <LangContext.Provider value={{ lang, toggle, isRTL: lang === 'ar' }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</div>
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
