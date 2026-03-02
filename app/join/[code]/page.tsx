import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
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

  redirect('/api/join/pending')
}
