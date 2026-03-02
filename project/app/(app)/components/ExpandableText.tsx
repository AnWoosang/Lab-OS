'use client'

import { useState } from 'react'

interface Props {
  text: string
  maxLines?: 1 | 2 | 3
}

const clampClass: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
}

export default function ExpandableText({ text, maxLines = 2 }: Props) {
  const [expanded, setExpanded] = useState(false)

  // Don't show toggle for short text (heuristic: < 80 chars rarely overflows)
  const isLong = text.length > 60

  if (!isLong) {
    return <span className="text-white/60 text-sm">{text}</span>
  }

  return (
    <span className="text-white/60 text-sm">
      <span className={expanded ? undefined : clampClass[maxLines]}>{text}</span>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="ml-1.5 text-primary text-xs hover:text-orange-400 transition-colors whitespace-nowrap"
      >
        {expanded ? '접기 ▴' : '펼치기 ▾'}
      </button>
    </span>
  )
}
