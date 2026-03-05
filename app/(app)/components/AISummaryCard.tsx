'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

interface Props {
  summaryAction: () => Promise<string>
}

export default function AISummaryCard({ summaryAction }: Props) {
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    setError(false)
    startTransition(async () => {
      try {
        const result = await summaryAction()
        setSummary(result)
      } catch {
        setError(true)
      }
    })
  }

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-white font-medium text-sm">AI 요약</span>
        {!summary && !isPending && (
          <button
            type="button"
            onClick={handleGenerate}
            className="ml-auto px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium border border-primary/30 hover:bg-primary/30 transition-colors"
          >
            AI 요약 생성
          </button>
        )}
        {summary && !isPending && (
          <button
            type="button"
            onClick={handleGenerate}
            className="ml-auto text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            재생성
          </button>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <LoadingSpinner />
          분석 중...
        </div>
      )}

      {error && !isPending && (
        <p className="text-red-400 text-sm">요약 생성에 실패했습니다. 다시 시도해주세요.</p>
      )}

      {summary && !isPending && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-100/80 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {!summary && !isPending && !error && (
        <p className="text-white/25 text-xs">"AI 요약 생성" 버튼을 클릭하면 Gemini가 현황을 분석합니다.</p>
      )}
    </div>
  )
}
