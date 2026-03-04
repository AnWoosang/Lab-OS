import { BarTrack } from './BarTrack'

export function ProgressBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/30 text-sm">—</span>
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1">
        <BarTrack pct={value} semantics="progress" />
      </div>
      <span className="text-white/60 text-xs font-mono w-8 text-right shrink-0">{value}%</span>
    </div>
  )
}
