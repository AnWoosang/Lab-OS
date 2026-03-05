'use server'

import { revalidatePath } from 'next/cache'
import { createSSRClient } from '@/lib/supabase-ssr'
import { getUserProfile, getSignedUrl, createSignedUploadUrl, deleteFile } from '@/lib/supabase'
import { processFile, parseExpense as parseExpenseGemini } from '@/lib/gemini'
import {
  findProjectByCode,
  findProjectByCardLast4,
  createReport,
  createExpense,
  createUploadSession,
  updateUploadSession,
  getProjectBudgets,
} from '@/lib/db'
import type { ReportData, ExpenseData } from '@/lib/schemas'

export interface UploadResult {
  ok: boolean
  type?: 'report' | 'expense' | 'unknown'
  message?: string
  error?: string
  sessionId?: string
  budgetCategory?: string | null
  budgetCategoryAutoAssigned?: boolean
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

// ── Step 1: 클라이언트가 Supabase에 직접 업로드할 Presigned URL 발급 ──────────────

export async function getUploadUrlAction(
  fileName: string,
  mimeType: string
): Promise<{ ok: boolean; signedUrl?: string; storagePath?: string; error?: string }> {
  if (!SUPPORTED_TYPES.includes(mimeType)) {
    return { ok: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, PDF)' }
  }

  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: '로그인이 필요합니다.' }

  const profile = await getUserProfile(user.id)
  if (!profile?.workspaceId) return { ok: false, error: '온보딩을 먼저 완료해주세요.' }

  const today = new Date().toISOString().slice(0, 10)
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : ''
  const storagePath = `${profile.workspaceId}/${today}/${crypto.randomUUID()}${ext}`

  try {
    const { signedUrl, path } = await createSignedUploadUrl(storagePath)
    return { ok: true, signedUrl, storagePath: path }
  } catch (err) {
    console.error('[upload] Presigned URL 생성 실패:', err)
    return { ok: false, error: '업로드 준비 중 오류가 발생했습니다.' }
  }
}

// ── Step 2: 업로드된 파일을 Supabase에서 가져와 Gemini 처리 후 DB 저장 ───────────

export async function processUploadAction(
  storagePath: string,
  fileName: string,
  mimeType: string,
  projectId: string | null,
  budgetCategory: string | null = null
): Promise<UploadResult> {
  let sessionId: string | undefined

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '로그인이 필요합니다.' }

    const profile = await getUserProfile(user.id)
    if (!profile?.workspaceId) return { ok: false, error: '온보딩을 먼저 완료해주세요.' }
    const { workspaceId } = profile

    console.log('[upload] ① 처리 시작:', fileName, '| 프로젝트:', projectId ?? '(미선택)')

    // ── 업로드 세션 생성 ────────────────────────────────────────────────────────
    sessionId = await createUploadSession({ userId: user.id, workspaceId, projectId, fileName, fileUrl: storagePath })

    // ── Supabase Storage에서 파일 다운로드 ─────────────────────────────────────
    console.log('[upload] ② Supabase 다운로드:', storagePath)
    const signedUrl = await getSignedUrl(storagePath, 120)
    const response = await fetch(signedUrl)
    if (!response.ok) throw new Error(`Storage fetch failed: ${response.status} ${response.statusText}`)

    const buffer = Buffer.from(await response.arrayBuffer())
    console.log('[upload] ✓ 다운로드 완료:', (buffer.length / 1024).toFixed(1), 'KB')

    // 서버사이드 파일 크기 검증 (15MB)
    if (buffer.length > 15 * 1024 * 1024) {
      await deleteFile(storagePath)
      await updateUploadSession(sessionId, { status: 'error', errorMsg: 'FILE_TOO_LARGE' })
      return { ok: false, error: '파일 크기는 15MB를 초과할 수 없습니다.', sessionId }
    }

    // ── Gemini OCR ────────────────────────────────────────────────────────────
    console.log('[upload] ③ Gemini OCR 처리 중...')
    const { type, data } = await processFile(buffer, mimeType)
    console.log('[upload] ✓ Gemini 결과 type:', type)

    // ── DB 저장 ───────────────────────────────────────────────────────────────
    if (type === 'report') {
      const reportData = data as ReportData
      if (reportData.error_code) {
        await deleteFile(storagePath)
        await updateUploadSession(sessionId, { status: 'error', errorMsg: reportData.error_code })
        return { ok: false, type, error: '파일 내용을 읽을 수 없습니다. 더 선명한 이미지나 PDF를 사용해주세요.', sessionId }
      }

      let resolvedProjectId = projectId
      if (!resolvedProjectId && reportData.project_code) {
        resolvedProjectId = await findProjectByCode(workspaceId, reportData.project_code)
        if (resolvedProjectId) console.log('[upload] ✓ 과제코드로 프로젝트 자동 매핑:', reportData.project_code)
      }

      if (!resolvedProjectId) {
        const errMsg = reportData.project_code
          ? `보고서의 과제 코드(${reportData.project_code})와 일치하는 프로젝트가 없습니다. 프로젝트를 먼저 생성해주세요.`
          : '프로젝트를 선택해주세요.'
        await updateUploadSession(sessionId, { status: 'error', errorMsg: errMsg })
        return { ok: false, type, error: errMsg, sessionId }
      }

      // 주간 보고서 작성자 = 업로드한 사람 (Gemini 추출값 무시)
      reportData.student_name = profile.name ?? null

      await createReport(workspaceId, resolvedProjectId, reportData, storagePath, sessionId)
      await updateUploadSession(sessionId, { status: 'done', resultType: 'report', resultData: data as Record<string, unknown> })
      revalidatePath('/lab')
      console.log('[upload] ✓ 보고서 저장 완료!')

      return {
        ok: true,
        type: 'report',
        message: `보고서 분석 완료! 상태: ${
          reportData.risk_score === 'red' ? '🔴 Red Zone' :
          reportData.risk_score === 'yellow' ? '🟡 Warning' : '🟢 On Track'
        }${reportData.bottleneck ? `\n병목: ${reportData.bottleneck}` : ''}`,
        sessionId,
      }
    }

    if (type === 'expense') {
      const expenseData = data as ExpenseData
      if (expenseData.error_code) {
        await deleteFile(storagePath)
        await updateUploadSession(sessionId, { status: 'error', errorMsg: expenseData.error_code })
        return { ok: false, type, error: '파일 내용을 읽을 수 없습니다. 더 선명한 이미지나 PDF를 사용해주세요.', sessionId }
      }

      let resolvedProjectId = projectId
      if (!resolvedProjectId && expenseData.card_last4) {
        resolvedProjectId = await findProjectByCardLast4(workspaceId, expenseData.card_last4)
        if (resolvedProjectId) console.log('[upload] ✓ 카드 끝 4자리로 프로젝트 자동 식별:', expenseData.card_last4)
      }

      if (!resolvedProjectId) {
        await updateUploadSession(sessionId, { status: 'error', errorMsg: '프로젝트를 선택해주세요.' })
        return { ok: false, type, error: '프로젝트를 선택해주세요.', sessionId }
      }

      // AI 예산 항목 자동 분류 (사전 선택 없을 때)
      let finalBudgetCategory = budgetCategory
      let autoAssigned = false
      if (!finalBudgetCategory) {
        const projectBudgets = await getProjectBudgets(resolvedProjectId, workspaceId)
        if (projectBudgets.length > 0) {
          const categories = projectBudgets.map((b) => b.category)
          const enriched = await parseExpenseGemini(buffer, mimeType, categories)
          finalBudgetCategory = enriched.budget_category ?? null
          if (finalBudgetCategory) autoAssigned = true
          console.log('[upload] ✓ AI 예산 분류:', finalBudgetCategory)
        }
      }

      await createExpense(workspaceId, resolvedProjectId, expenseData, storagePath, finalBudgetCategory)
      await updateUploadSession(sessionId, { status: 'done', resultType: 'expense', resultData: data as Record<string, unknown> })
      revalidatePath('/lab')
      console.log('[upload] ✓ 영수증 저장 완료!')

      const suspiciousNote = expenseData.is_suspicious ? ' ⚠️ 부적합 항목 포함' : ''
      return {
        ok: true,
        type: 'expense',
        message: `영수증 등록 완료! ${expenseData.vendor ?? ''} · ${expenseData.total_amount?.toLocaleString() ?? '?'}원 · ${expenseData.category}${suspiciousNote}`,
        sessionId,
        budgetCategory: finalBudgetCategory,
        budgetCategoryAutoAssigned: autoAssigned,
      }
    }

    // Unknown
    await deleteFile(storagePath)
    await updateUploadSession(sessionId, { status: 'error', resultType: 'unknown' })
    return {
      ok: false,
      type: 'unknown',
      error: '보고서나 영수증으로 인식되지 않은 파일입니다. 주간 진행 보고서 또는 지출 영수증 파일만 업로드 가능합니다.',
      sessionId,
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upload] ✗ 예외 발생:', msg)
    if (sessionId) {
      try { await updateUploadSession(sessionId, { status: 'error', errorMsg: msg }) } catch {}
    }

    let friendlyError: string
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
      friendlyError = 'AI 처리 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
    } else if (msg.includes('timeout') || msg.includes('deadline')) {
      friendlyError = '처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    } else {
      friendlyError = '파일 처리 중 오류가 발생했습니다. 보고서나 영수증 파일(PDF/이미지)인지 확인해주세요.'
    }
    return { ok: false, error: friendlyError }
  }
}
