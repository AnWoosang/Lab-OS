import { type LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, message, sub }: { icon?: LucideIcon; message: string; sub?: string }) {
  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 p-16 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-white/20" />
        </div>
      )}
      <p className="text-white/40 text-sm">{message}</p>
      {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
    </div>
  )
}
