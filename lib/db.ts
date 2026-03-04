/**
 * lib/db.ts — Supabase CRUD operations (replaces notion.ts)
 * All functions use the service-role client (bypasses RLS).
 */

import { cache } from 'react'
import { createServerClient } from './supabase'
import type { UserProfile } from './supabase'
import type { ReportData, ExpenseData } from './schemas'

// ─── Row types ────────────────────────────────────────────────────────────────

export interface ProjectRow {
  id: string
  projectCode: string
  projectName: string | null
  leadStudent: string | null
  status: string
  riskScore: number | null
  bottleneck: string | null
  budgetTotal: number | null
  budgetUsed: number | null
  startDate: string | null
  endDate: string | null
  cardLast4: string | null
  isCompleted: boolean
}

export interface ReportRow {
  id: string
  projectId: string
  reportDate: string | null
  content: string | null
  bottleneck: string | null
  nextPlan: string | null
  aiAnalysis: string | null
  progress: number | null
  fileUrl: string | null
  studentName: string | null
  createdAt: string
}

export interface ExpenseRow {
  id: string
  projectId: string
  amount: number
  vendor: string | null
  category: string | null
  budgetCategory: string | null
  isSuspicious: boolean
  receiptUrl: string | null
  createdAt: string
}

export interface ProjectBudgetRow {
  id: string
  projectId: string
  category: string
  allocatedAmount: number
}

export interface BudgetSummaryItem {
  category: string
  allocatedAmount: number
  usedAmount: number
  remaining: number
}

export interface UploadSessionRow {
  id: string
  userId: string
  workspaceId: string
  projectId: string | null
  fileName: string
  fileUrl: string | null
  resultType: 'report' | 'expense' | 'unknown' | null
  resultData: Record<string, unknown> | null
  status: 'processing' | 'done' | 'error'
  errorMsg: string | null
  createdAt: string
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getAllProjects = cache(async (workspaceId: string): Promise<ProjectRow[]> => {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('status', { ascending: true })

  if (error) {
    console.error('[db:projects] getAllProjects error:', error)
    return []
  }

  return (data ?? []).map(mapProjectRow)
})

export async function getProjectById(
  projectId: string,
  workspaceId: string
): Promise<ProjectRow | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error || !data) return null
  return mapProjectRow(data)
}

export async function findOrCreateProject(
  workspaceId: string,
  projectCode: string,
  projectName: string | null
): Promise<string> {
  const supabase = createServerClient()

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('project_code', projectCode)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: workspaceId,
      project_code: projectCode,
      project_name: projectName,
      status: 'on_track',
    })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create project: ${error?.message}`)
  return created.id
}

export async function updateProjectStatus(
  projectId: string,
  status: 'on_track' | 'warning' | 'red_zone',
  riskScore: number,
  bottleneck: string | null
): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('projects')
    .update({ status, risk_score: riskScore, bottleneck })
    .eq('id', projectId)
}

function mapProjectRow(row: Record<string, unknown>): ProjectRow {
  return {
    id: row.id as string,
    projectCode: row.project_code as string,
    projectName: (row.project_name as string | null) ?? null,
    leadStudent: (row.lead_student as string | null) ?? null,
    status: (row.status as string) ?? 'on_track',
    riskScore: (row.risk_score as number | null) ?? null,
    bottleneck: (row.bottleneck as string | null) ?? null,
    budgetTotal: (row.budget_total as number | null) ?? null,
    budgetUsed: (row.budget_used as number | null) ?? null,
    startDate: (row.start_date as string | null) ?? null,
    endDate: (row.end_date as string | null) ?? null,
    cardLast4: (row.card_last4 as string | null) ?? null,
    isCompleted: (row.is_completed as boolean) ?? false,
  }
}

export async function findProjectByCode(
  workspaceId: string,
  projectCode: string
): Promise<string | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('project_code', projectCode)
    .single()
  return data?.id ?? null
}

export async function findProjectByCardLast4(
  workspaceId: string,
  cardLast4: string
): Promise<string | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('card_last4', cardLast4)
    .single()

  if (error || !data) return null
  return data.id
}

export async function updateProjectCardLast4(
  projectId: string,
  workspaceId: string,
  cardLast4: string
): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('projects')
    .update({ card_last4: cardLast4 })
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function createReport(
  workspaceId: string,
  projectId: string,
  data: ReportData,
  fileUrl: string,
  sessionId?: string
): Promise<string> {
  const supabase = createServerClient()

  // Derive status from Gemini risk_score
  const statusMap = { red: 'red_zone', yellow: 'warning', green: 'on_track' } as const
  const status = statusMap[data.risk_score] ?? 'on_track'
  const riskScoreNum = data.risk_score === 'red' ? 80 : data.risk_score === 'yellow' ? 50 : 20

  // Update project status if not green
  if (data.risk_score !== 'green') {
    await updateProjectStatus(projectId, status, riskScoreNum, data.bottleneck)
  }

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      report_date: data.report_date ?? null,
      content: data.summary,
      bottleneck: data.bottleneck ?? null,
      next_plan: data.next_plan ?? null,
      ai_analysis: data.ai_analysis ?? null,
      progress: data.progress,
      file_url: fileUrl,
      student_name: data.student_name ?? null,
      upload_session_id: sessionId ?? null,
    })
    .select('id')
    .single()

  if (error || !report) throw new Error(`Failed to create report: ${error?.message}`)

  // Auto-create action for red zone
  if (data.risk_score === 'red') {
    await createAction(workspaceId, projectId, 'late_report')
  }

  return report.id
}

export async function getReportsForProject(
  projectId: string,
  workspaceId: string,
  limit = 20
): Promise<ReportRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('project_id', projectId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    reportDate: row.report_date,
    content: row.content,
    bottleneck: (row.bottleneck as string | null) ?? null,
    nextPlan: (row.next_plan as string | null) ?? null,
    aiAnalysis: (row.ai_analysis as string | null) ?? null,
    progress: row.progress,
    fileUrl: row.file_url,
    studentName: (row.student_name as string | null) ?? null,
    createdAt: row.created_at,
  }))
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function createExpense(
  workspaceId: string,
  projectId: string,
  data: ExpenseData,
  fileUrl: string,
  budgetCategory?: string | null
): Promise<string> {
  const supabase = createServerClient()

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      amount: data.total_amount ?? 0,
      vendor: data.vendor,
      receipt_url: fileUrl,
      category: data.category,
      budget_code: data.budget_code,
      is_suspicious: data.is_suspicious,
      budget_category: budgetCategory ?? null,
    })
    .select('id')
    .single()

  if (error || !expense) throw new Error(`Failed to create expense: ${error?.message}`)
  return expense.id
}

export async function getExpensesForProject(
  projectId: string,
  workspaceId: string
): Promise<ExpenseRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    amount: row.amount,
    vendor: row.vendor,
    category: row.category,
    budgetCategory: (row.budget_category as string | null) ?? null,
    isSuspicious: row.is_suspicious,
    receiptUrl: row.receipt_url,
    createdAt: row.created_at,
  }))
}

// ─── Project Budgets ──────────────────────────────────────────────────────────

export async function getProjectBudgets(
  projectId: string,
  workspaceId: string
): Promise<ProjectBudgetRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('project_budgets')
    .select('*')
    .eq('project_id', projectId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    category: row.category,
    allocatedAmount: row.allocated_amount,
  }))
}

export async function setProjectBudgets(
  projectId: string,
  workspaceId: string,
  items: { category: string; allocatedAmount: number }[]
): Promise<void> {
  const supabase = createServerClient()
  await supabase.from('project_budgets').delete().eq('project_id', projectId).eq('workspace_id', workspaceId)

  if (items.length === 0) return

  const { error } = await supabase.from('project_budgets').insert(
    items.map((item) => ({
      workspace_id: workspaceId,
      project_id: projectId,
      category: item.category,
      allocated_amount: item.allocatedAmount,
    }))
  )
  if (error) throw new Error(`Failed to set project budgets: ${error.message}`)
}

export async function getBudgetSummary(
  projectId: string,
  workspaceId: string
): Promise<BudgetSummaryItem[]> {
  const supabase = createServerClient()

  const [budgets, expenses] = await Promise.all([
    getProjectBudgets(projectId, workspaceId),
    supabase
      .from('expenses')
      .select('budget_category, amount')
      .eq('project_id', projectId)
      .eq('workspace_id', workspaceId)
      .not('budget_category', 'is', null),
  ])

  if (budgets.length === 0) return []

  // Aggregate used amounts by category
  const usedMap: Record<string, number> = {}
  for (const row of expenses.data ?? []) {
    const cat = row.budget_category as string
    usedMap[cat] = (usedMap[cat] ?? 0) + (row.amount as number)
  }

  return budgets.map((b) => ({
    category: b.category,
    allocatedAmount: b.allocatedAmount,
    usedAmount: usedMap[b.category] ?? 0,
    remaining: b.allocatedAmount - (usedMap[b.category] ?? 0),
  }))
}

// ─── Project Members ──────────────────────────────────────────────────────────

export interface ProjectMemberRow {
  id: string
  projectId: string
  name: string
  userId: string | null
  createdAt: string
}

export async function getProjectMembers(
  projectId: string,
  workspaceId: string
): Promise<ProjectMemberRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    userId: (row.user_id as string | null) ?? null,
    createdAt: row.created_at,
  }))
}

export async function addProjectMember(
  projectId: string,
  workspaceId: string,
  name: string,
  userId?: string
): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      workspace_id: workspaceId,
      name,
      user_id: userId ?? null,
    })
}

export async function getApprovedStudents(workspaceId: string): Promise<UserProfile[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('role', 'student')
    .eq('status', 'approved')
    .order('name', { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    role: row.role as 'student',
    name: row.name,
    email: row.email,
    status: row.status as 'approved',
  }))
}

export async function getProjectsByUserId(
  userId: string,
  workspaceId: string
): Promise<ProjectRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_members!inner(user_id)')
    .eq('workspace_id', workspaceId)
    .eq('project_members.user_id', userId)

  if (error) {
    console.error('[db:projects] getProjectsByUserId error:', error)
    return []
  }

  return (data ?? []).map(mapProjectRow)
}

export async function getProjectMembersWithUserIds(
  workspaceId: string
): Promise<ProjectMemberRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .not('user_id', 'is', null)

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    userId: (row.user_id as string | null) ?? null,
    createdAt: row.created_at,
  }))
}

export async function removeProjectMember(
  memberId: string,
  workspaceId: string
): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
}

// ─── Project Leads ─────────────────────────────────────────────────────────────

export async function getAllProjectLeads(
  workspaceId: string
): Promise<Record<string, UserProfile[]>> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('project_leads')
    .select('project_id, user_id, users(id, name, email, role, workspace_id, status)')
    .eq('workspace_id', workspaceId)

  if (error || !data) return {}

  const result: Record<string, UserProfile[]> = {}
  for (const row of data) {
    const user = (row.users as unknown) as { id: string; name: string; email: string; role: string; workspace_id: string; status: string } | null
    if (!user) continue
    const profile: UserProfile = {
      id: user.id,
      workspaceId: user.workspace_id,
      role: user.role as UserProfile['role'],
      name: user.name,
      email: user.email,
      status: user.status as UserProfile['status'],
    }
    const pid = row.project_id as string
    if (!result[pid]) result[pid] = []
    result[pid].push(profile)
  }
  return result
}

export async function setProjectLeads(
  projectId: string,
  workspaceId: string,
  userIds: string[]
): Promise<void> {
  const supabase = createServerClient()
  await supabase.from('project_leads').delete().eq('project_id', projectId).eq('workspace_id', workspaceId)
  if (userIds.length > 0) {
    const { error } = await supabase.from('project_leads').insert(
      userIds.map((uid) => ({ project_id: projectId, workspace_id: workspaceId, user_id: uid }))
    )
    if (error) throw new Error(`Failed to set project leads: ${error.message}`)
  }
}

// ─── Reports: workspace-wide ──────────────────────────────────────────────────

export interface ReportWithProject extends ReportRow {
  projectCode: string
  projectName: string | null
}

export interface ExpenseWithProject extends ExpenseRow {
  projectCode: string
  projectName: string | null
}

interface DateFilterOpts {
  from?: string
  to?: string
  order?: 'asc' | 'desc'
}

export async function getAllReports(
  workspaceId: string,
  limit = 50,
  opts?: DateFilterOpts
): Promise<ReportWithProject[]> {
  const supabase = createServerClient()
  let query = supabase
    .from('reports')
    .select('*, projects(project_code, project_name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: opts?.order === 'asc' })
    .limit(limit)

  if (opts?.from) query = query.gte('created_at', opts.from)
  if (opts?.to) query = query.lte('created_at', opts.to)

  const { data, error } = await query

  if (error) {
    console.error('[db:reports] getAllReports error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    reportDate: row.report_date,
    content: row.content,
    bottleneck: (row.bottleneck as string | null) ?? null,
    nextPlan: (row.next_plan as string | null) ?? null,
    aiAnalysis: (row.ai_analysis as string | null) ?? null,
    progress: row.progress,
    fileUrl: row.file_url,
    studentName: (row.student_name as string | null) ?? null,
    createdAt: row.created_at,
    projectCode: (row.projects as { project_code: string; project_name: string | null } | null)?.project_code ?? '—',
    projectName: (row.projects as { project_code: string; project_name: string | null } | null)?.project_name ?? null,
  }))
}

export async function getAllExpenses(
  workspaceId: string,
  limit = 50,
  opts?: DateFilterOpts
): Promise<ExpenseWithProject[]> {
  const supabase = createServerClient()
  let query = supabase
    .from('expenses')
    .select('*, projects(project_code, project_name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: opts?.order === 'asc' })
    .limit(limit)

  if (opts?.from) query = query.gte('created_at', opts.from)
  if (opts?.to) query = query.lte('created_at', opts.to)

  const { data, error } = await query

  if (error) {
    console.error('[db:expenses] getAllExpenses error:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    amount: row.amount,
    vendor: row.vendor,
    category: row.category,
    budgetCategory: (row.budget_category as string | null) ?? null,
    isSuspicious: row.is_suspicious,
    receiptUrl: row.receipt_url,
    createdAt: row.created_at,
    projectCode: (row.projects as { project_code: string; project_name: string | null } | null)?.project_code ?? '—',
    projectName: (row.projects as { project_code: string; project_name: string | null } | null)?.project_name ?? null,
  }))
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createAction(
  workspaceId: string,
  projectId: string,
  triggerType: 'late_report' | 'low_progress' | 'budget_overrun'
): Promise<string> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('actions')
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      trigger_type: triggerType,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Failed to create action: ${error?.message}`)
  return data.id
}

// ─── Upload Sessions ──────────────────────────────────────────────────────────

export async function createUploadSession(params: {
  userId: string
  workspaceId: string
  projectId: string | null
  fileName: string
  fileUrl?: string
}): Promise<string> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('upload_sessions')
    .insert({
      user_id: params.userId,
      workspace_id: params.workspaceId,
      project_id: params.projectId,
      file_name: params.fileName,
      file_url: params.fileUrl ?? null,
      status: 'processing',
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Failed to create upload session: ${error?.message}`)
  return data.id
}

export async function updateUploadSession(
  sessionId: string,
  update: {
    status?: 'processing' | 'done' | 'error'
    fileUrl?: string
    resultType?: 'report' | 'expense' | 'unknown'
    resultData?: Record<string, unknown>
    errorMsg?: string
  }
): Promise<void> {
  const supabase = createServerClient()

  const payload: Record<string, unknown> = {}
  if (update.status !== undefined) payload.status = update.status
  if (update.fileUrl !== undefined) payload.file_url = update.fileUrl
  if (update.resultType !== undefined) payload.result_type = update.resultType
  if (update.resultData !== undefined) payload.result_data = update.resultData
  if (update.errorMsg !== undefined) payload.error_msg = update.errorMsg

  await supabase.from('upload_sessions').update(payload).eq('id', sessionId)
}

export async function deleteReport(id: string, workspaceId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function deleteExpense(id: string, workspaceId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function deleteProject(projectId: string, workspaceId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function updateProjectMeta(
  projectId: string,
  workspaceId: string,
  data: {
    projectCode: string
    projectName: string | null
    leadStudent?: string | null
    startDate?: string | null
    endDate?: string | null
    cardLast4?: string | null
  }
): Promise<void> {
  const supabase = createServerClient()
  const update: Record<string, unknown> = {
    project_code: data.projectCode.toUpperCase(),
    project_name: data.projectName,
  }
  if ('leadStudent' in data) update.lead_student = data.leadStudent ?? null
  if ('startDate' in data) update.start_date = data.startDate ?? null
  if ('endDate' in data) update.end_date = data.endDate ?? null
  if ('cardLast4' in data) update.card_last4 = data.cardLast4 ?? null

  const { error } = await supabase
    .from('projects')
    .update(update)
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function updateExpenseBudgetCategory(
  expenseId: string,
  workspaceId: string,
  budgetCategory: string | null
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('expenses')
    .update({ budget_category: budgetCategory })
    .eq('id', expenseId)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function setProjectCompleted(
  projectId: string,
  workspaceId: string,
  isCompleted: boolean
): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('projects')
    .update({ is_completed: isCompleted })
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
  if (error) throw error
}

export async function getUploadSessionsForUser(
  userId: string,
  workspaceId: string,
  limit = 50
): Promise<UploadSessionRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('upload_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    resultType: row.result_type,
    resultData: row.result_data,
    status: row.status,
    errorMsg: row.error_msg,
    createdAt: row.created_at,
  }))
}
