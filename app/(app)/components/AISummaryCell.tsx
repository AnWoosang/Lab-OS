'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'

interface Props {
  generateAction: () => Promise<string>
}

export default function AISummaryCell({ generateAction }: Props) {
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    setError(false)
    startTransition(async () => {
      try {
        const result = await generateAction()
        setSummary(result)
      } catch {
        setError(true)
      }
    })
  }

  if (summary) {
    return (
      <span className="text-blue-200/70 text-xs leading-relaxed max-w-[220px] block">
        {summary}
      </span>
    )
  }

  if (error) {
    return (
      <button
        type="button"
        onClick={handleGenerate}
        className="text-red-400/60 text-xs hover:text-red-400 transition-colors"
      >
        오류 · 재시도
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isPending}
      className="flex items-center gap-1 text-primary/50 hover:text-primary text-xs transition-colors disabled:opacity-50"
    >
      <Sparkles className="w-3 h-3" />
      {isPending ? (
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          생성 중
        </span>
      ) : '요약'}
    </button>
  )
}
