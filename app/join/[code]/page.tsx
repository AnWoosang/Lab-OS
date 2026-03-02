import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { FlaskConical, AlertCircle } from 'lucide-react'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { getWorkspaceByJoinCode, createUserProfile } from '@/lib/supabase'
import { createSSRClient } from '@/lib/supabase-ssr'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ code: string }>
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
      <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-white text-xl font-bold mb-2">참여 실패</h1>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors"
        >
          홈으로
        </a>
      </div>
    </div>
  )
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const { authUser, profile } = await getCurrentUserWithProfile()

  // Not logged in → send to login with redirect back here
  if (!authUser) {
    redirect(`/login?redirect=/join/${upperCode}`)
  }

  // Already a professor → error
  if (profile?.role === 'professor') {
    return <ErrorCard message="교수 계정으로는 연구실에 참여할 수 없습니다." />
  }

  // Already a student (approved or pending) → redirect appropriately
  if (profile?.role === 'student') {
    if (profile.status === 'pending') redirect('/pending')
    else redirect('/upload')
  }

  // No profile yet → auto-join
  const workspace = await getWorkspaceByJoinCode(upperCode)
  if (!workspace) {
    return <ErrorCard message="유효하지 않은 초대 링크입니다. 교수님께 새 링크를 요청하세요." />
  }

  // Get full user metadata from SSR client
  const supabase = await createSSRClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    await createUserProfile({
      userId: authUser.id,
      workspaceId: workspace.id,
      role: 'student',
      name: user?.user_metadata?.full_name ?? null,
      email: user?.email ?? null,
      status: 'pending',
    })
  } catch {
    return <ErrorCard message="참여 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." />
  }

  const cookieStore = await cookies()
  cookieStore.set('lab_role', 'pending', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  // Show pending screen
  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
      <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FlaskConical className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">승인 대기 중</h1>
        <p className="text-white/60 text-sm mb-2">
          <span className="text-white font-semibold">{workspace.labName}</span>에 참여 신청했습니다.
        </p>
        <p className="text-white/40 text-xs mb-6">교수님이 승인하면 자동으로 입장됩니다.</p>
        <a
          href="/pending"
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          대기 화면으로
        </a>
      </div>
    </div>
  )
}
