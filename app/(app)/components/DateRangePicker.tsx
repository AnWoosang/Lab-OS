'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  basePath: string
  currentProjectId?: string | null
}

export default function DateRangePicker({ basePath, currentProjectId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [from, setFrom] = useState(searchParams?.get('from') ?? '')
  const [to, setTo] = useState(searchParams?.get('to') ?? '')

  const apply = () => {
    const params = new URLSearchParams()
    if (currentProjectId) params.set('project', currentProjectId)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  const reset = () => {
    setFrom('')
    setTo('')
    const params = new URLSearchParams()
    if (currentProjectId) params.set('project', currentProjectId)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  const hasFilter = searchParams?.has('from') || searchParams?.has('to')

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      <span className="text-white/30 text-xs">기간</span>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none focus:border-primary/50"
      />
      <span className="text-white/30 text-xs">~</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none focus:border-primary/50"
      />
      <button
        onClick={apply}
        className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-medium hover:bg-primary/30 transition-colors"
      >
        적용
      </button>
      {hasFilter && (
        <button
          onClick={reset}
          className="px-2.5 py-1 rounded-lg text-white/40 border border-white/10 text-xs hover:text-white/70 transition-colors"
        >
          초기화
        </button>
      )}
    </div>
  )
}
