export const STATUS_CONFIG = {
  red_zone: {
    label: 'Red Zone',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  on_track: {
    label: 'On Track',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
  },
}

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.on_track
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${c.className}`}>
      {c.label}
    </span>
  )
}

export function StatusDot({ status }: { status: string }) {
  const c = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.on_track
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${c.dot}`} title={c.label} />
}
