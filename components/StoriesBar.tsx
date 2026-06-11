'use client'

import { useState } from 'react'
import type { Vendor } from '@/lib/vendors'
import type { Lang } from '@/lib/i18n'

interface Props {
  vendors: Vendor[]
  lang: Lang
}

export default function StoriesBar({ vendors, lang }: Props) {
  const [activeStory, setActiveStory] = useState<{ vendor: Vendor; storyIdx: number } | null>(null)

  const vendorsWithStories = vendors.filter(v => v.stories.length > 0)

  if (!vendorsWithStories.length) return null

  const story = activeStory
    ? activeStory.vendor.stories[activeStory.storyIdx]
    : null

  const closeStory = () => setActiveStory(null)

  const nextStory = () => {
    if (!activeStory) return
    const { vendor, storyIdx } = activeStory
    if (storyIdx + 1 < vendor.stories.length) {
      setActiveStory({ vendor, storyIdx: storyIdx + 1 })
    } else {
      // Move to next vendor
      const idx = vendorsWithStories.indexOf(vendor)
      if (idx + 1 < vendorsWithStories.length) {
        setActiveStory({ vendor: vendorsWithStories[idx + 1], storyIdx: 0 })
      } else {
        closeStory()
      }
    }
  }

  return (
    <>
      {/* Story circles */}
      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
        {vendorsWithStories.map(vendor => (
          <button
            key={vendor.id}
            onClick={() => setActiveStory({ vendor, storyIdx: 0 })}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${vendor.bgGradient} flex items-center justify-center text-2xl ring-2 ring-rose-400 ring-offset-2`}>
              {vendor.emoji}
            </div>
            <span className="text-xs text-gray-600 max-w-[64px] truncate">
              {lang === 'ar' ? vendor.nameAr : vendor.nameEn}
            </span>
          </button>
        ))}
      </div>

      {/* Full-screen story viewer */}
      {activeStory && story && (
        <div
          className={`fixed inset-0 z-50 bg-gradient-to-br ${story.bgGradient} flex flex-col`}
          onClick={nextStory}
        >
          {/* Progress bars */}
          <div className="flex gap-1 px-3 pt-4">
            {activeStory.vendor.stories.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-white/30">
                <div
                  className={`h-full rounded-full bg-white transition-all duration-300 ${i < activeStory.storyIdx ? 'w-full' : i === activeStory.storyIdx ? 'w-1/2' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              {activeStory.vendor.emoji}
            </div>
            <span className="text-white font-semibold text-sm">
              {lang === 'ar' ? activeStory.vendor.nameAr : activeStory.vendor.nameEn}
            </span>
            <button
              onClick={e => { e.stopPropagation(); closeStory() }}
              className="ms-auto text-white text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Story content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-8xl mb-6">{story.emoji}</div>
            <p className="text-white text-2xl font-bold leading-tight">
              {lang === 'ar' ? story.textAr : story.textEn}
            </p>
          </div>

          <p className="text-white/60 text-xs text-center pb-8">Tap to continue</p>
        </div>
      )}
    </>
  )
}
