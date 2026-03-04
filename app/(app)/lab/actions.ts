'use server'

import { revalidatePath } from 'next/cache'
import { getWorkspaceContext } from '@/lib/workspace-context'
import {
  addProjectMember,
  removeProjectMember,
  deleteProject,
  updateProjectMeta,
  setProjectCompleted,
  getProjectBudgets,
  setProjectBudgets,
  setProjectLeads,
  updateExpenseBudgetCategory,
  type ProjectBudgetRow,
} from '@/lib/db'
import { approveStudent, rejectStudent, createServerClient } from '@/lib/supabase'
import { logError } from '@/lib/logger'

export async function createProjectAction(
  _prevState: { error?: string; ok?: boolean; projectCode?: string } | null,
  formData: FormData
) {
  const { workspaceId } = await getWorkspaceContext()
  const projectCode = (formData.get('project_code') as string | null)?.trim().toUpperCase()
  const projectName = (formData.get('project_name') as string | null)?.trim() || null
  const startDate = (formData.get('start_date') as string | null)?.trim() || null
  const endDate = (formData.get('end_date') as string | null)?.trim() || null
  const cardLast4 = (formData.get('card_last4') as string | null)?.trim() || null
  const budgetItemsJson = formData.get('budget_items') as string | null
  const leadIdsJson = formData.get('lead_ids') as string | null

  if (!projectCode) return { error: '과제코드를 입력해주세요.' }
  if (projectCode.length > 50) return { error: '과제코드가 너무 깁니다.' }

  try {
    const supabase = createServerClient()

    // Check if project code already exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('project_code', projectCode)
      .single()

    let projectId: string
    if (existing) {
      projectId = existing.id
    } else {
      const budgetItems = budgetItemsJson ? JSON.parse(budgetItemsJson) as { category: string; allocatedAmount: number }[] : []
      const totalBudget = budgetItems.reduce((sum: number, b: { allocatedAmount: number }) => sum + b.allocatedAmount, 0)

      const { data: created, error } = await supabase
        .from('projects')
        .insert({
          workspace_id: workspaceId,
          project_code: projectCode,
          project_name: projectName,
          start_date: startDate,
          end_date: endDate,
          card_last4: cardLast4,
          budget_total: totalBudget > 0 ? totalBudget : null,
          status: 'on_track',
        })
        .select('id')
        .single()

      if (error || !created) throw new Error(error?.message)
      projectId = created.id

      if (budgetItems.length > 0) {
        await setProjectBudgets(projectId, workspaceId, budgetItems)
      }

      if (leadIdsJson) {
        const leadIds: string[] = JSON.parse(leadIdsJson)
        if (leadIds.length > 0) {
          await setProjectLeads(projectId, workspaceId, leadIds)
        }
      }
    }

    revalidatePath('/lab')
    return { ok: true, projectCode }
  } catch (e) {
    logError('createProjectAction', e)
    return { error: '프로젝트 생성에 실패했습니다.' }
  }
}

export async function getProjectBudgetsAction(projectId: string): Promise<ProjectBudgetRow[]> {
  try {
    const { workspaceId } = await getWorkspaceContext()
    return await getProjectBudgets(projectId, workspaceId)
  } catch {
    return []
  }
}

export async function upsertProjectBudgetsAction(
  projectId: string,
  items: { category: string; allocatedAmount: number }[]
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const { workspaceId } = await getWorkspaceContext()
    await setProjectBudgets(projectId, workspaceId, items)
    revalidatePath(`/projects/${projectId}`)
    return { ok: true }
  } catch (e) {
    logError('upsertProjectBudgetsAction', e)
    return { error: '예산 항목 저장에 실패했습니다.' }
  }
}

export async function approveStudentAction(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    await approveStudent(userId)
    revalidatePath('/lab')
  } catch (e) {
    logError('approveStudentAction', e)
  }
}

export async function rejectStudentAction(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    await rejectStudent(userId)
    revalidatePath('/lab')
  } catch (e) {
    logError('rejectStudentAction', e)
  }
}

export async function assignStudentAction(formData: FormData) {
  try {
    const { workspaceId } = await getWorkspaceContext()
    const userId = formData.get('userId') as string
    const projectId = formData.get('projectId') as string

    const supabase = createServerClient()

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
  } catch (e) {
    logError('assignStudentAction', e)
  }
}

export async function unassignStudentAction(formData: FormData) {
  try {
    const { workspaceId } = await getWorkspaceContext()
    const memberId = formData.get('memberId') as string
    await removeProjectMember(memberId, workspaceId)
    revalidatePath('/lab')
  } catch (e) {
    logError('unassignStudentAction', e)
  }
}

export async function deleteProjectAction(formData: FormData) {
  try {
    const { workspaceId } = await getWorkspaceContext()
    await deleteProject(formData.get('projectId') as string, workspaceId)
    revalidatePath('/lab')
    revalidatePath('/dashboard')
  } catch (e) {
    logError('deleteProjectAction', e)
  }
}

export async function updateProjectMetaAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const { workspaceId } = await getWorkspaceContext()
  const projectCode = (formData.get('projectCode') as string)?.trim().toUpperCase()
  if (!projectCode) return { error: '과제코드를 입력해주세요.' }

  const projectId = formData.get('projectId') as string
  const budgetItemsJson = formData.get('budget_items') as string | null

  try {
    await updateProjectMeta(projectId, workspaceId, {
      projectCode,
      projectName: (formData.get('projectName') as string | null)?.trim() || null,
      leadStudent: (formData.get('leadStudent') as string | null)?.trim() || null,
      startDate: (formData.get('startDate') as string | null)?.trim() || null,
      endDate: (formData.get('endDate') as string | null)?.trim() || null,
      cardLast4: (formData.get('cardLast4') as string | null)?.trim() || null,
    })

    if (budgetItemsJson) {
      const budgetItems = JSON.parse(budgetItemsJson) as { category: string; allocatedAmount: number }[]
      const totalBudget = budgetItems.reduce((sum, b) => sum + b.allocatedAmount, 0)
      const supabase = createServerClient()
      await supabase.from('projects').update({
        budget_total: totalBudget > 0 ? totalBudget : null,
      }).eq('id', projectId).eq('workspace_id', workspaceId)
      await setProjectBudgets(projectId, workspaceId, budgetItems)
    }

    const leadUserIdsJson = formData.get('lead_user_ids') as string | null
    if (leadUserIdsJson) {
      const userIds: string[] = JSON.parse(leadUserIdsJson)
      await setProjectLeads(projectId, workspaceId, userIds)
    }

    revalidatePath('/lab')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e) {
    logError('updateProjectMetaAction', e)
    return { error: '프로젝트 수정에 실패했습니다.' }
  }
}

export async function updateExpenseBudgetCategoryAction(
  expenseId: string,
  budgetCategory: string | null
): Promise<{ ok?: boolean; error?: string }> {
  try {
    const { workspaceId } = await getWorkspaceContext()
    await updateExpenseBudgetCategory(expenseId, workspaceId, budgetCategory)
    revalidatePath('/expenses')
    return { ok: true }
  } catch (e) {
    logError('updateExpenseBudgetCategoryAction', e)
    return { error: '예산 항목 업데이트에 실패했습니다.' }
  }
}

export async function toggleProjectCompletedAction(formData: FormData) {
  try {
    const { workspaceId } = await getWorkspaceContext()
    const isCompleted = formData.get('isCompleted') === 'true'
    await setProjectCompleted(formData.get('projectId') as string, workspaceId, !isCompleted)
    revalidatePath('/lab')
    revalidatePath('/dashboard')
  } catch (e) {
    logError('toggleProjectCompletedAction', e)
  }
}
