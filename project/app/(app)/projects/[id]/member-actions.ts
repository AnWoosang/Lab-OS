'use server'

import { revalidatePath } from 'next/cache'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { addProjectMember, removeProjectMember } from '@/lib/db'

export async function addMemberAction(
  _prevState: { error?: string; ok?: boolean } | null,
  formData: FormData
) {
  const { workspaceId } = await getWorkspaceContext()
  const projectId = formData.get('projectId') as string
  const tab = formData.get('tab') as string | null

  if (tab === 'account') {
    const userId = (formData.get('userId') as string | null)?.trim()
    if (!userId) return { error: '학생을 선택해주세요.' }

    // Fetch student name from DB to store
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()
    const name = user?.name ?? user?.email ?? userId

    await addProjectMember(projectId, workspaceId, name, userId)
  } else {
    const name = (formData.get('name') as string | null)?.trim()
    if (!name) return { error: '이름을 입력해주세요.' }
    if (name.length > 50) return { error: '이름이 너무 깁니다.' }
    await addProjectMember(projectId, workspaceId, name)
  }

  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function removeMemberAction(
  _prevState: { error?: string; ok?: boolean } | null,
  formData: FormData
) {
  const { workspaceId } = await getWorkspaceContext()
  const memberId = formData.get('memberId') as string
  const projectId = formData.get('projectId') as string

  await removeProjectMember(memberId, workspaceId)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}
