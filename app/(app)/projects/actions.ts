'use server'

import { getWorkspaceContext } from '@/lib/workspace-context'
import { getBudgetSummary, getExpensesForProject, type BudgetSummaryItem, type ExpenseRow } from '@/lib/db'

export async function getBudgetDetailAction(projectId: string): Promise<{
  budgetSummary: BudgetSummaryItem[]
  expenses: ExpenseRow[]
}> {
  const { workspaceId } = await getWorkspaceContext()
  const [budgetSummary, expenses] = await Promise.all([
    getBudgetSummary(projectId, workspaceId),
    getExpensesForProject(projectId, workspaceId),
  ])
  return { budgetSummary, expenses }
}
