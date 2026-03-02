'use server'

import { createSSRClient } from '@/lib/supabase-ssr'
import { getUserProfile, uploadFile, deleteFile } from '@/lib/supabase'
import { processFile } from '@/lib/gemini'
import {
  findOrCreateProject,
  findProjectByCardLast4,
  createReport,
  createExpense,
  createUploadSession,
  updateUploadSession,
} from '@/lib/db'
import type { ReportData, ExpenseData } from '@/lib/schemas'

export interface UploadResult {
  ok: boolean
  type?: 'report' | 'expense' | 'unknown'
  message?: string
  error?: string
  sessionId?: string
}

export async function uploadFileAction(
  _prevState: UploadResult | null,
  formData: FormData
): Promise<UploadResult> {
  let sessionId: string | undefined

  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────────
    console.log('[upload] ① 인증 확인 중...')
    const supabase = await createSSRClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError) console.error('[upload] 인증 오류:', authError.message)
    if (!user) {
      console.warn('[upload] ✗ 비로그인 상태')
      return { ok: false, error: '로그인이 필요합니다.' }
    }
    console.log('[upload] ✓ 사용자:', user.id, user.email)

    const profile = await getUserProfile(user.id)
    if (!profile?.workspaceId) {
      console.warn('[upload] ✗ 프로필/워크스페이스 없음:', profile)
      return { ok: false, error: '온보딩을 먼저 완료해주세요.' }
    }
    const { workspaceId } = profile
    console.log('[upload] ✓ 워크스페이스:', workspaceId, '| 역할:', profile.role)

    // ── 2. File validation ─────────────────────────────────────────────────────
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      console.warn('[upload] ✗ 파일 없음')
      return { ok: false, error: '파일을 선택해주세요.' }
    }
    console.log('[upload] ② 파일:', file.name, `(${(file.size / 1024).toFixed(1)} KB, ${file.type})`)

    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ]
    if (!supportedTypes.includes(file.type)) {
      console.warn('[upload] ✗ 지원하지 않는 MIME 타입:', file.type)
      return { ok: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, PDF)' }
    }

    if (file.size > 20 * 1024 * 1024) {
      console.warn('[upload] ✗ 파일 크기 초과:', file.size)
      return { ok: false, error: '파일 크기는 20MB를 초과할 수 없습니다.' }
    }

    const projectId = (formData.get('projectId') as string | null) || null
    console.log('[upload] 선택된 프로젝트ID:', projectId ?? '(자동 감지)')

    // ── 3. Supabase Storage upload ─────────────────────────────────────────────
    console.log('[upload] ③ Supabase Storage 업로드 중...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const today = new Date().toISOString().slice(0, 10)
    const storagePath = await uploadFile(buffer, file.name, file.type, `${workspaceId}/${today}`)
    console.log('[upload] ✓ Storage 업로드 완료, 경로:', storagePath)

    // ── 4. Create upload session ───────────────────────────────────────────────
    sessionId = await createUploadSession({
      userId: user.id,
      workspaceId,
      projectId,
      fileName: file.name,
      fileUrl: storagePath,
    })
    console.log('[upload] ✓ 업로드 세션 생성:', sessionId)

    // ── 5. Gemini OCR ──────────────────────────────────────────────────────────
    console.log('[upload] ④ Gemini OCR 처리 중...')
    const { type, data } = await processFile(buffer, file.type)
    console.log('[upload] ✓ Gemini 결과 type:', type, '| data:', JSON.stringify(data))

    // ── 6. Save to DB ──────────────────────────────────────────────────────────
    if (type === 'report') {
      const reportData = data as ReportData
      if (reportData.error_code) {
        console.warn('[upload] ✗ 보고서 오류 코드:', reportData.error_code)
        await deleteFile(storagePath)
        await updateUploadSession(sessionId, { status: 'error', errorMsg: reportData.error_code })
        return {
          ok: false,
          type,
          error: '파일 내용을 읽을 수 없습니다. 더 선명한 이미지나 PDF를 사용해주세요.',
          sessionId,
        }
      }

      let resolvedProjectId = projectId
      if (!resolvedProjectId && reportData.project_code) {
        console.log('[upload] 프로젝트 조회/생성:', reportData.project_code)
        resolvedProjectId = await findOrCreateProject(
          workspaceId,
          reportData.project_code,
          reportData.project_name
        )
        console.log('[upload] ✓ 프로젝트ID:', resolvedProjectId)
      }

      if (!resolvedProjectId) {
        console.warn('[upload] ✗ 프로젝트ID 없음 — 저장 불가')
        await updateUploadSession(sessionId, {
          status: 'error',
          errorMsg: '프로젝트를 선택하거나 보고서에 과제 코드를 포함해주세요.',
        })
        return { ok: false, type, error: '프로젝트를 선택해주세요.', sessionId }
      }

      console.log('[upload] ⑤ 보고서 DB 저장 중...')
      await createReport(workspaceId, resolvedProjectId, reportData, storagePath, sessionId)
      await updateUploadSession(sessionId, {
        status: 'done',
        resultType: 'report',
        resultData: data as Record<string, unknown>,
      })
      console.log('[upload] ✓ 보고서 저장 완료!')

      return {
        ok: true,
        type: 'report',
        message: `보고서 분석 완료! 진도율: ${reportData.progress ?? '미확인'}% · 상태: ${
          reportData.risk_score === 'red'
            ? '🔴 Red Zone'
            : reportData.risk_score === 'yellow'
            ? '🟡 Warning'
            : '🟢 On Track'
        }${reportData.bottleneck ? `\n병목: ${reportData.bottleneck}` : ''}`,
        sessionId,
      }
    }

    if (type === 'expense') {
      const expenseData = data as ExpenseData
      if (expenseData.error_code) {
        console.warn('[upload] ✗ 영수증 오류 코드:', expenseData.error_code)
        await deleteFile(storagePath)
        await updateUploadSession(sessionId, { status: 'error', errorMsg: expenseData.error_code })
        return {
          ok: false,
          type,
          error: '파일 내용을 읽을 수 없습니다. 더 선명한 이미지나 PDF를 사용해주세요.',
          sessionId,
        }
      }

      let resolvedProjectId = projectId
      if (!resolvedProjectId && expenseData.card_last4) {
        resolvedProjectId = await findProjectByCardLast4(workspaceId, expenseData.card_last4)
        if (resolvedProjectId) console.log('[upload] ✓ 카드 끝 4자리로 프로젝트 자동 식별:', expenseData.card_last4)
      }
      if (!resolvedProjectId && expenseData.budget_code) {
        console.log('[upload] 프로젝트 조회/생성 (budget_code):', expenseData.budget_code)
        resolvedProjectId = await findOrCreateProject(workspaceId, expenseData.budget_code, null)
        console.log('[upload] ✓ 프로젝트ID:', resolvedProjectId)
      }

      if (!resolvedProjectId) {
        console.warn('[upload] ✗ 프로젝트ID 없음 — 저장 불가')
        await updateUploadSession(sessionId, {
          status: 'error',
          errorMsg: '프로젝트를 선택해주세요.',
        })
        return { ok: false, type, error: '프로젝트를 선택해주세요.', sessionId }
      }

      console.log('[upload] ⑤ 영수증 DB 저장 중... category:', expenseData.category)
      await createExpense(workspaceId, resolvedProjectId, expenseData, storagePath)
      await updateUploadSession(sessionId, {
        status: 'done',
        resultType: 'expense',
        resultData: data as Record<string, unknown>,
      })
      console.log('[upload] ✓ 영수증 저장 완료!')

      const suspiciousNote = expenseData.is_suspicious ? ' ⚠️ 부적합 항목 포함' : ''
      return {
        ok: true,
        type: 'expense',
        message: `영수증 등록 완료! ${expenseData.vendor ?? ''} · ${expenseData.total_amount?.toLocaleString() ?? '?'}원 · ${expenseData.category}${suspiciousNote}`,
        sessionId,
      }
    }

    // Unknown type
    console.warn('[upload] ✗ 파일 유형 미인식 (unknown)')
    await deleteFile(storagePath)
    await updateUploadSession(sessionId, { status: 'error', resultType: 'unknown' })
    return {
      ok: false,
      type: 'unknown',
      error: '보고서나 영수증이 아닌 것 같아요. 주간 진행 보고서 또는 지출 영수증을 올려주세요.',
      sessionId,
    }
  } catch (err) {
    console.error('[upload] ✗ 예외 발생:', err)
    if (sessionId) {
      try {
        await updateUploadSession(sessionId, {
          status: 'error',
          errorMsg: err instanceof Error ? err.message : '알 수 없는 오류',
        })
      } catch {}
    }
    return { ok: false, error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }
}
