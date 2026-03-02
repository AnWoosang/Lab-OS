export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded w-40"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-deep-navy-light rounded-xl p-5 border border-white/10 h-24"></div>
        ))}
      </div>
      <div className="bg-deep-navy-light rounded-xl border border-white/10 h-64"></div>
    </div>
  )
}
