'use server'

import { revalidatePath } from 'next/cache'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getAllExpenses, deleteExpense } from '@/lib/db'
import { summarizeExpenses, summarizeExpenseRow } from '@/lib/gemini'
import { logError } from '@/lib/logger'

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

export async function deleteExpenseAction(expenseId: string): Promise<void> {
  try {
    const { workspaceId } = await getWorkspaceContext()
    await deleteExpense(expenseId, workspaceId)
    revalidatePath('/expenses')
  } catch (e) {
    logError('deleteExpenseAction', e)
    throw e
  }
}
