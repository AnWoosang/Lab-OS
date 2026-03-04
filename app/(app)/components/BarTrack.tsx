interface BarTrackProps {
  pct: number
  semantics?: 'progress' | 'budget'
}

export function BarTrack({ pct, semantics = 'progress' }: BarTrackProps) {
  let color: string
  if (semantics === 'budget') {
    color = pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-green-400'
  } else {
    color = pct < 65 ? 'bg-red-400' : pct < 80 ? 'bg-amber-400' : 'bg-green-400'
  }
  return (
    <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
