'use server'

import { revalidatePath } from 'next/cache'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { deleteReport } from '@/lib/db'
import { logError } from '@/lib/logger'

export async function deleteReportAction(reportId: string): Promise<void> {
  try {
    const { workspaceId } = await getWorkspaceContext()
    await deleteReport(reportId, workspaceId)
    revalidatePath('/reports')
  } catch (e) {
    logError('deleteReportAction', e)
    throw e
  }
}
