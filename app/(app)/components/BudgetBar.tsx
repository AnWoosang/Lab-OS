import { BarTrack } from './BarTrack'

function fmtKRW(n: number): string {
  if (Math.abs(n) >= 10000) return `${Math.round(n / 10000).toLocaleString()}만원`
  return `${n.toLocaleString()}원`
}

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
    <div className="space-y-1 min-w-[120px]">
      <div className="flex items-center gap-2">
        <div className="w-20">
          <BarTrack pct={pct} semantics="budget" />
        </div>
        <span className="text-white/60 text-xs font-mono">{pct}%</span>
      </div>
      <p className="text-white/40 text-xs font-mono whitespace-nowrap">
        {fmtKRW(safeUsed)} / {fmtKRW(total)}
      </p>
      <p className={`text-xs font-mono whitespace-nowrap ${remaining < 0 ? 'text-red-400' : 'text-white/30'}`}>
        잔여 {fmtKRW(remaining)}
      </p>
    </div>
  )
}
