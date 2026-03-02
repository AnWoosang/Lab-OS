'use server'

import { getWorkspaceContext } from '@/lib/workspace-context'
import { getAllExpenses } from '@/lib/db'
import { summarizeExpenses, summarizeExpenseRow } from '@/lib/gemini'

export async function generateExpenseSummaryAction(): Promise<string> {
  const { workspaceId } = await getWorkspaceContext()
  const expenses = await getAllExpenses(workspaceId, 200)
  return summarizeExpenses(expenses)
}

export async function generateExpenseRowSummaryAction(expense: {
  vendor: string | null
  amount: number
  category: string | null
  isSuspicious: boolean
  createdAt: string
}): Promise<string> {
  await getWorkspaceContext() // auth check
  return summarizeExpenseRow(expense)
}
