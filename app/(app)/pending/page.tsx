import { redirect } from 'next/navigation'
import { Clock } from 'lucide-react'
import { getCurrentUserWithProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function PendingPage() {
  const { authUser, profile } = await getCurrentUserWithProfile()

  if (!authUser) redirect('/login')

  // If approved, refresh role cookie via Route Handler and redirect
  if (profile?.status === 'approved') {
    redirect('/api/refresh-role')
  }

  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
      {/* Auto-refresh every 10 seconds */}
      <meta httpEquiv="refresh" content="10" />

      <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">승인 대기 중</h1>
        <p className="text-white/60 text-sm mb-2">교수님의 승인을 기다리는 중입니다.</p>
        <p className="text-white/40 text-xs mb-6">
          승인되면 자동으로 업로드 화면으로 이동됩니다.
          <br />
          (10초마다 자동 새로고침)
        </p>
        <div className="flex items-center justify-center gap-2 text-amber-400/60 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          대기 중...
        </div>
      </div>
    </div>
  )
}
