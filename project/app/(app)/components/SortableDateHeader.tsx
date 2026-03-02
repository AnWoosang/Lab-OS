'use client'

import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface Props {
  currentOrder: 'asc' | 'desc'
  basePath: string // 기존 쿼리 파라미터 포함 경로 (e.g. "/reports?project=xxx&period=month")
}

export default function SortableDateHeader({ currentOrder, basePath }: Props) {
  const router = useRouter()

  const nextOrder = currentOrder === 'desc' ? 'asc' : 'desc'
  const separator = basePath.includes('?') ? '&' : '?'
  const nextUrl = `${basePath}${separator}order=${nextOrder}`

  return (
    <button
      type="button"
      onClick={() => router.push(nextUrl)}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs font-medium"
    >
      날짜
      {currentOrder === 'desc' ? (
        <ArrowDown className="w-3 h-3 text-primary/70" />
      ) : currentOrder === 'asc' ? (
        <ArrowUp className="w-3 h-3 text-primary/70" />
      ) : (
        <ArrowUpDown className="w-3 h-3" />
      )}
    </button>
  )
}
