'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { regenerateJoinCode } from '@/lib/supabase'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { createServerClient } from '@/lib/supabase'

export async function regenerateJoinCodeAction(): Promise<{ ok: boolean; joinCode?: string; error?: string }> {
  const { profile } = await getCurrentUserWithProfile()

  if (!profile) return { ok: false, error: '로그인이 필요합니다.' }
  if (profile.role !== 'professor') return { ok: false, error: '교수 계정만 링크를 재생성할 수 있습니다.' }
  if (!profile.workspaceId) return { ok: false, error: '워크스페이스가 없습니다.' }

  try {
    const joinCode = await regenerateJoinCode(profile.workspaceId)
    revalidateTag('workspace')
    return { ok: true, joinCode }
  } catch (err) {
    console.error('[dashboard:regenerateJoinCode]', err)
    return { ok: false, error: '링크 재생성 중 오류가 발생했습니다.' }
  }
}

export async function toggleProfessorResolvedAction(
  reportId: string,
  resolved: boolean
): Promise<void> {
  await getWorkspaceContext()

  const supabase = createServerClient()
  const { error } = await supabase
    .from('reports')
    .update({ professor_resolved: resolved })
    .eq('id', reportId)

  if (error) throw new Error(`Failed to update professor_resolved: ${error.message}`)

  revalidatePath('/dashboard')
}
