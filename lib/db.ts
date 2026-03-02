/**
 * lib/db.ts — Supabase CRUD operations (replaces notion.ts)
 * All functions use the service-role client (bypasses RLS).
 */

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
}

export interface ReportRow {
  id: string
  projectId: string
  reportDate: string | null
  content: string | null
  progress: number | null
  fileUrl: string | null
  createdAt: string
}

export interface ExpenseRow {
  id: string
  projectId: string
  amount: number
  vendor: string | null
  category: string | null
  isSuspicious: boolean
  receiptUrl: string | null
  createdAt: string
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

export async function getAllProjects(workspaceId: string): Promise<ProjectRow[]> {
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
}

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
  }
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
      progress: data.progress,
      file_url: fileUrl,
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
    progress: row.progress,
    fileUrl: row.file_url,
    createdAt: row.created_at,
  }))
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function createExpense(
  workspaceId: string,
  projectId: string,
  data: ExpenseData,
  fileUrl: string
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
    isSuspicious: row.is_suspicious,
    receiptUrl: row.receipt_url,
    createdAt: row.created_at,
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
    progress: row.progress,
    fileUrl: row.file_url,
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
