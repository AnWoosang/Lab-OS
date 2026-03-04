import { BarTrack } from './BarTrack'

interface BudgetBarProps {
  used: number | null
  total: number | null
  compact?: boolean
}

export function BudgetBar({ used, total, compact = false }: BudgetBarProps) {
  if (!total) return <span className="text-white/30 text-sm">—</span>
  const safeUsed = used ?? 0
  const pct = Math.min(Math.round((safeUsed / total) * 100), 100)

  if (compact) {
    return (
      <div className="flex items-center gap-2 w-24">
        <div className="flex-1">
          <BarTrack pct={pct} semantics="budget" />
        </div>
        <span className="text-white/60 text-xs font-mono">{pct}%</span>
      </div>
    )
  }

  const remaining = total - safeUsed
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-20">
          <BarTrack pct={pct} semantics="budget" />
        </div>
        <span className="text-white/60 text-xs font-mono">{pct}%</span>
      </div>
      <p className={`text-xs font-mono ${remaining < 0 ? 'text-red-400' : 'text-white/40'}`}>
        잔여 {remaining.toLocaleString()}원
      </p>
    </div>
  )
}
