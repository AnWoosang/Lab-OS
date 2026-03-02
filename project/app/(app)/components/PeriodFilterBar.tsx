'use client'

import { useRouter } from 'next/navigation'

interface Props {
  currentPeriod: string
  basePath: string
  currentProjectId?: string | null
}

const PERIODS = [
  { value: 'all', label: '전체' },
  { value: 'month', label: '이번 달' },
  { value: 'quarter', label: '3개월' },
  { value: 'half', label: '6개월' },
]

export default function PeriodFilterBar({ currentPeriod, basePath, currentProjectId }: Props) {
  const router = useRouter()

  const buildUrl = (period: string) => {
    const params = new URLSearchParams()
    if (period !== 'all') params.set('period', period)
    if (currentProjectId) params.set('project', currentProjectId)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="flex gap-2 mt-3">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => router.push(buildUrl(p.value))}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            (currentPeriod ?? 'all') === p.value
              ? 'bg-primary/20 text-primary border-primary/40'
              : 'text-white/40 hover:text-white/70 border-transparent hover:border-white/10'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
