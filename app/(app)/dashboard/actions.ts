'use server'

import { getCurrentUserWithProfile } from '@/lib/auth'
import { regenerateJoinCode } from '@/lib/supabase'
import { summarizeProjectRow } from '@/lib/gemini'
import { getWorkspaceContext } from '@/lib/workspace-context'

export async function generateDashboardProjectRowSummaryAction(project: {
  projectCode: string
  projectName: string | null
  status: string
  bottleneck: string | null
  riskScore: number | null
  budgetTotal: number | null
  budgetUsed: number | null
}): Promise<string> {
  await getWorkspaceContext() // auth check
  return summarizeProjectRow(project)
}

export async function regenerateJoinCodeAction(): Promise<{ ok: boolean; joinCode?: string; error?: string }> {
  const { profile } = await getCurrentUserWithProfile()

  if (!profile) return { ok: false, error: '로그인이 필요합니다.' }
  if (profile.role !== 'professor') return { ok: false, error: '교수 계정만 링크를 재생성할 수 있습니다.' }
  if (!profile.workspaceId) return { ok: false, error: '워크스페이스가 없습니다.' }

  try {
    const joinCode = await regenerateJoinCode(profile.workspaceId)
    return { ok: true, joinCode }
  } catch (err) {
    console.error('[dashboard:regenerateJoinCode]', err)
    return { ok: false, error: '링크 재생성 중 오류가 발생했습니다.' }
  }
}
