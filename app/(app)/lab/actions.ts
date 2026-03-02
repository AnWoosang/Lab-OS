'use server'

import { revalidatePath } from 'next/cache'
import { getWorkspaceContext } from '@/lib/workspace-context'
import {
  findOrCreateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
  updateProjectMeta,
  setProjectCompleted,
} from '@/lib/db'
import { approveStudent, rejectStudent, createServerClient } from '@/lib/supabase'

export async function createProjectAction(
  _prevState: { error?: string; ok?: boolean; projectCode?: string } | null,
  formData: FormData
) {
  const { workspaceId } = await getWorkspaceContext()
  const projectCode = (formData.get('project_code') as string | null)?.trim().toUpperCase()
  const projectName = (formData.get('project_name') as string | null)?.trim() || null

  if (!projectCode) return { error: '과제코드를 입력해주세요.' }
  if (projectCode.length > 50) return { error: '과제코드가 너무 깁니다.' }

  await findOrCreateProject(workspaceId, projectCode, projectName)
  revalidatePath('/lab')
  return { ok: true, projectCode }
}

export async function approveStudentAction(formData: FormData) {
  const userId = formData.get('userId') as string
  await approveStudent(userId)
  revalidatePath('/lab')
}

export async function rejectStudentAction(formData: FormData) {
  const userId = formData.get('userId') as string
  await rejectStudent(userId)
  revalidatePath('/lab')
}

export async function assignStudentAction(formData: FormData) {
  const { workspaceId } = await getWorkspaceContext()
  const userId = formData.get('userId') as string
  const projectId = formData.get('projectId') as string

  const supabase = createServerClient()

  // Prevent duplicates
  const { data: existing } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!existing) {
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()
    const name = user?.name ?? user?.email ?? userId
    await addProjectMember(projectId, workspaceId, name, userId)
  }

  revalidatePath('/lab')
}

export async function unassignStudentAction(formData: FormData) {
  const { workspaceId } = await getWorkspaceContext()
  const memberId = formData.get('memberId') as string
  await removeProjectMember(memberId, workspaceId)
  revalidatePath('/lab')
}

export async function deleteProjectAction(formData: FormData) {
  const { workspaceId } = await getWorkspaceContext()
  await deleteProject(formData.get('projectId') as string, workspaceId)
  revalidatePath('/lab')
  revalidatePath('/dashboard')
}

export async function updateProjectMetaAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const { workspaceId } = await getWorkspaceContext()
  const projectCode = (formData.get('projectCode') as string)?.trim().toUpperCase()
  if (!projectCode) return { error: '과제코드를 입력해주세요.' }
  await updateProjectMeta(formData.get('projectId') as string, workspaceId, {
    projectCode,
    projectName: (formData.get('projectName') as string | null)?.trim() || null,
  })
  revalidatePath('/lab')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function toggleProjectCompletedAction(formData: FormData) {
  const { workspaceId } = await getWorkspaceContext()
  const isCompleted = formData.get('isCompleted') === 'true'
  await setProjectCompleted(formData.get('projectId') as string, workspaceId, !isCompleted)
  revalidatePath('/lab')
  revalidatePath('/dashboard')
}
