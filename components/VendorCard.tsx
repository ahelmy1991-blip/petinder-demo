'use client'

import Link from 'next/link'
import type { Vendor } from '@/lib/vendors'
import type { Lang } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface Props {
  vendor: Vendor
  lang: Lang
}

export default function VendorCard({ vendor, lang }: Props) {
  const tr = t[lang]
  return (
    <Link href={`/vendors/${vendor.id}`}>
      <div className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
        <div className={`bg-gradient-to-br ${vendor.bgGradient} h-32 flex items-center justify-center`}>
          <span className="text-6xl">{vendor.emoji}</span>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-bold text-gray-900 text-sm leading-tight">
              {lang === 'ar' ? vendor.nameAr : vendor.nameEn}
            </span>
            {vendor.verified && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
          </div>
          <div className="text-gray-400 text-xs mb-1">
            📍 {lang === 'ar' ? vendor.districtAr : vendor.districtEn}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-500 font-medium">⭐ {vendor.rating}</span>
            <span className="text-xs text-gray-400">{vendor.deliveryTime} {tr.deliveryTime}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
