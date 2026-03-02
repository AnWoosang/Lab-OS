/**
 * Internal API route for file processing.
 * Accepts a multipart form with: file, projectId (optional), workspaceId, userId
 * Returns: { ok, type, data, fileUrl, sessionId }
 */

import { NextRequest } from 'next/server'
import { processFile } from '@/lib/gemini'
import { uploadFile, getUserProfile } from '@/lib/supabase'
import {
  findOrCreateProject,
  createReport,
  createExpense,
  createUploadSession,
  updateUploadSession,
} from '@/lib/db'
import { createSSRClient } from '@/lib/supabase-ssr'
import type { ReportData, ExpenseData } from '@/lib/schemas'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let sessionId: string | undefined

  try {
    // Auth via session cookie
    const supabase = await createSSRClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await getUserProfile(user.id)
    if (!profile?.workspaceId) {
      return Response.json({ error: 'Workspace not configured' }, { status: 401 })
    }

    const { workspaceId } = profile

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = (formData.get('projectId') as string | null) || null

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const supportedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
    ]
    if (!supportedMimeTypes.includes(file.type)) {
      return Response.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage
    const storagePath = await uploadFile(buffer, file.name, file.type, `uploads/${workspaceId}`)

    // Create session
    sessionId = await createUploadSession({
      userId: user.id,
      workspaceId,
      projectId,
      fileName: file.name,
      fileUrl: storagePath,
    })

    // Process with Gemini
    const { type, data } = await processFile(buffer, file.type)

    let resolvedProjectId = projectId

    if (type === 'report') {
      const reportData = data as ReportData
      if (!resolvedProjectId && reportData.project_code) {
        resolvedProjectId = await findOrCreateProject(
          workspaceId,
          reportData.project_code,
          reportData.project_name
        )
      }
      if (resolvedProjectId && !reportData.error_code) {
        await createReport(workspaceId, resolvedProjectId, reportData, storagePath, sessionId)
      }
    } else if (type === 'expense') {
      const expenseData = data as ExpenseData
      if (!resolvedProjectId && expenseData.budget_code) {
        resolvedProjectId = await findOrCreateProject(workspaceId, expenseData.budget_code, null)
      }
      if (resolvedProjectId && !expenseData.error_code) {
        await createExpense(workspaceId, resolvedProjectId, expenseData, storagePath)
      }
    }

    await updateUploadSession(sessionId, {
      status: 'done',
      resultType: type as 'report' | 'expense' | 'unknown',
      resultData: data as Record<string, unknown>,
    })

    return Response.json({ ok: true, type, data, fileUrl: storagePath, sessionId })
  } catch (err) {
    console.error('[process-file]', err)
    if (sessionId) {
      try {
        await updateUploadSession(sessionId, {
          status: 'error',
          errorMsg: err instanceof Error ? err.message : 'Internal error',
        })
      } catch {}
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
