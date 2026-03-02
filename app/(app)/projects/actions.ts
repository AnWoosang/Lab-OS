'use server'

import { getWorkspaceContext } from '@/lib/workspace-context'
import { getAllProjects } from '@/lib/db'
import { summarizeProjects, summarizeProjectRow } from '@/lib/gemini'

export async function generateProjectSummaryAction(): Promise<string> {
  const { workspaceId } = await getWorkspaceContext()
  const projects = await getAllProjects(workspaceId)
  return summarizeProjects(projects)
}

export async function generateProjectRowSummaryAction(project: {
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
