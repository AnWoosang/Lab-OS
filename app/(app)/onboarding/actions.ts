'use server'

import { cookies } from 'next/headers'
import { createSSRClient } from '@/lib/supabase-ssr'
import {
  createWorkspace,
  getWorkspaceByJoinCode,
  createUserProfile,
  getUserProfile,
} from '@/lib/supabase'

export interface OnboardingState {
  ok: boolean | null
  error: string | null
  joinCode?: string
  role?: 'professor' | 'student'
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch {
    return null
  }
}

// ─── Professor: create workspace ──────────────────────────────────────────────

export async function professorOnboardAction(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const labName = (formData.get('labName') as string | null)?.trim()
  if (!labName) return { ok: false, error: '연구실명을 입력해주세요.' }

  const userId = await getAuthUserId()
  if (!userId) return { ok: false, error: '로그인이 필요합니다.' }

  // Block users who already have a profile
  const existing = await getUserProfile(userId)
  if (existing) {
    if (existing.role === 'professor') {
      const cookieStore = await cookies()
      cookieStore.set('lab_role', 'professor', {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      })
      return { ok: true, error: null, joinCode: undefined, role: 'professor' }
    }
    // Student trying to escalate to professor — block
    return {
      ok: false,
      error: '이미 학생으로 등록된 계정입니다. 교수님 계정이 필요하다면 새 계정을 사용하세요.',
    }
  }

  try {
    const workspace = await createWorkspace(labName)
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()

    await createUserProfile({
      userId,
      workspaceId: workspace.id,
      role: 'professor',
      name: user?.user_metadata?.full_name ?? null,
      email: user?.email ?? null,
    })

    const cookieStore = await cookies()
    cookieStore.set('lab_role', 'professor', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })

    return { ok: true, error: null, joinCode: workspace.joinCode, role: 'professor' }
  } catch (err) {
    console.error('[onboarding:professor]', err)
    return { ok: false, error: '워크스페이스 생성 중 오류가 발생했습니다.' }
  }
}

// ─── Student: join workspace ──────────────────────────────────────────────────

export async function studentOnboardAction(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const joinCode = (formData.get('joinCode') as string | null)?.trim().toUpperCase()
  if (!joinCode || joinCode.length !== 6) {
    return { ok: false, error: '6자리 참여 코드를 입력해주세요.' }
  }

  const userId = await getAuthUserId()
  if (!userId) return { ok: false, error: '로그인이 필요합니다.' }

  // If already has a profile, set cookie based on current status
  const existing = await getUserProfile(userId)
  if (existing?.role === 'student') {
    const cookieStore = await cookies()
    const cookieRole = existing.status === 'pending' ? 'pending' : 'student'
    cookieStore.set('lab_role', cookieRole, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
    return { ok: true, error: null, role: 'student' }
  }

  try {
    const workspace = await getWorkspaceByJoinCode(joinCode)
    if (!workspace) {
      return { ok: false, error: '유효하지 않은 참여 코드입니다.' }
    }

    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()

    await createUserProfile({
      userId,
      workspaceId: workspace.id,
      role: 'student',
      name: user?.user_metadata?.full_name ?? null,
      email: user?.email ?? null,
      status: 'pending',
    })

    const cookieStore = await cookies()
    cookieStore.set('lab_role', 'pending', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })

    return { ok: true, error: null, role: 'student' }
  } catch (err) {
    console.error('[onboarding:student]', err)
    return { ok: false, error: '참여 중 오류가 발생했습니다.' }
  }
}
