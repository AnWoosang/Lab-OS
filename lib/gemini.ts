import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { REPORT_PARSER_SYSTEM_PROMPT } from './prompts/report-parser'
import { buildExpenseParserPrompt } from './prompts/expense-parser'
import { ReportSchema, ExpenseSchema, type FileType, type ReportData, type ExpenseData } from './schemas'
import type { ExpenseWithProject, ProjectRow } from './db'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

// ─── Retry wrapper ────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn() }
    catch (err) {
      if (i === maxRetries) throw err
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('unreachable')
}

// ─── File type detection ──────────────────────────────────────────────────────

export async function detectFileType(
  fileBuffer: Buffer,
  mimeType: string
): Promise<FileType> {
  console.log('[gemini] detectFileType — mimeType:', mimeType, 'bufferSize:', fileBuffer.length)
  const prompt = `이 파일을 다음 세 가지 중 하나로 분류해. 반드시 세 단어 중 하나만 반환한다.

"report": 연구/학술과 관련된 모든 문서
  — 주간 진도 보고서, 논문, 발표자료(PPT), 연구계획서, 기술 보고서,
    실험 결과 보고서, 학위 논문, 리뷰 논문, 분석 보고서 등

"expense": 지출 영수증 또는 지출 증빙 문서
  — 가게 영수증, 카드 전표, 세금계산서 등

"unknown": 위 두 가지에 해당하지 않는 파일
  — 셀카/인물 사진, 연구와 무관한 개인 사진, 카카오톡 등 채팅 캡처,
    빈 이미지, 의미 없는 테스트 이미지`

  const imagePart: Part = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  const result = await withRetry(() => flashModel.generateContent([prompt, imagePart]))
  const text = result.response.text().trim().toLowerCase()
  console.log('[gemini] detectFileType raw response:', text)

  if (text.includes('report')) return 'report'
  if (text.includes('expense')) return 'expense'
  console.warn('[gemini] detectFileType — 분류 불가, unknown 반환')
  return 'unknown'
}

// ─── Parse report ─────────────────────────────────────────────────────────────

export async function parseReport(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ReportData> {
  console.log('[gemini] parseReport 시작')
  const imagePart: Part = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  const result = await withRetry(() => proModel.generateContent([
    REPORT_PARSER_SYSTEM_PROMPT,
    imagePart,
  ]))
  const text = result.response.text().trim()
  console.log('[gemini] parseReport raw response (첫 200자):', text.slice(0, 200))

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  let jsonParsed: unknown
  try {
    jsonParsed = JSON.parse(cleaned)
  } catch (parseErr) {
    console.error('[gemini] JSON 파싱 실패:', parseErr, '\n원문:', cleaned)
    return {
      project_code: null, project_name: null, student_name: null,
      report_date: null, week_label: null, summary: '',
      progress: null, progress_estimated: false, bottleneck: null,
      next_plan: null, ai_analysis: null, risk_score: 'green', error_code: 'UNREADABLE_FILE',
    }
  }

  const parsed = ReportSchema.safeParse(jsonParsed)
  if (!parsed.success) {
    console.error('[gemini] Report schema validation failed:', parsed.error.issues)
    return {
      project_code: null, project_name: null, student_name: null,
      report_date: null, week_label: null, summary: '',
      progress: null, progress_estimated: false, bottleneck: null,
      next_plan: null, ai_analysis: null, risk_score: 'green', error_code: 'UNREADABLE_FILE',
    }
  }

  const data = parsed.data

  // Post-process: 미래 날짜는 할루시네이션 — null로 보정
  if (data.report_date) {
    const d = new Date(data.report_date)
    if (isNaN(d.getTime()) || d > new Date()) {
      console.warn('[gemini] report_date 미래/invalid 감지, null 처리:', data.report_date)
      data.report_date = null
    }
  }

  console.log('[gemini] ✓ parseReport 완료:', JSON.stringify(data))
  return data
}

// ─── Parse expense ────────────────────────────────────────────────────────────

export async function parseExpense(
  fileBuffer: Buffer,
  mimeType: string,
  budgetCategories?: string[]
): Promise<ExpenseData> {
  console.log('[gemini] parseExpense 시작')
  const imagePart: Part = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  }

  const result = await withRetry(() => flashModel.generateContent([
    buildExpenseParserPrompt(budgetCategories),
    imagePart,
  ]))
  const text = result.response.text().trim()
  console.log('[gemini] parseExpense raw response (첫 200자):', text.slice(0, 200))

  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

  let jsonParsed: unknown
  try {
    jsonParsed = JSON.parse(cleaned)
  } catch (parseErr) {
    console.error('[gemini] JSON 파싱 실패:', parseErr, '\n원문:', cleaned)
    return {
      vendor: null, receipt_date: null, total_amount: null,
      currency: 'KRW', items: [], category: '기타',
      budget_code: 'UNKNOWN', is_suspicious: false,
      suspicious_reason: null, card_last4: null, budget_category: null, error_code: 'UNREADABLE_FILE',
    }
  }

  const parsed = ExpenseSchema.safeParse(jsonParsed)
  if (!parsed.success) {
    console.error('[gemini] Expense schema validation failed:', parsed.error.issues)
    return {
      vendor: null, receipt_date: null, total_amount: null,
      currency: 'KRW', items: [], category: '기타',
      budget_code: 'UNKNOWN', is_suspicious: false,
      suspicious_reason: null, card_last4: null, budget_category: null, error_code: 'UNREADABLE_FILE',
    }
  }
  console.log('[gemini] ✓ parseExpense 완료:', JSON.stringify(parsed.data))
  return parsed.data
}

// ─── Summarize expenses ───────────────────────────────────────────────────────

export async function summarizeExpenses(expenses: ExpenseWithProject[]): Promise<string> {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const suspiciousCount = expenses.filter((e) => e.isSuspicious).length
  const categoryCounts: Record<string, number> = {}
  for (const e of expenses) {
    const cat = e.category ?? '기타'
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
  }
  const categoryText = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, cnt]) => `${cat}(${cnt}건)`)
    .join(', ')

  const prompt = `다음은 연구실의 지출 내역 요약입니다.
- 총 지출 건수: ${expenses.length}건
- 총 지출 금액: ${totalAmount.toLocaleString()}원
- 의심 영수증: ${suspiciousCount}건
- 카테고리별 분포: ${categoryText || '데이터 없음'}

위 정보를 바탕으로 교수가 파악해야 할 핵심 포인트를 한국어 2~3줄로 요약해줘.
총 지출 현황, 카테고리 분포 특이사항, 의심 건 위험도를 포함해.
단, 숫자나 항목 나열 없이 자연스러운 문장으로만 작성해.`

  const result = await flashModel.generateContent(prompt)
  return result.response.text().trim()
}

// ─── Summarize projects ───────────────────────────────────────────────────────

export async function summarizeProjects(projects: ProjectRow[]): Promise<string> {
  const redZone = projects.filter((p) => p.status === 'red_zone')
  const warning = projects.filter((p) => p.status === 'warning')
  const bottlenecks = projects
    .filter((p) => p.bottleneck)
    .map((p) => `[${p.projectCode}] ${p.bottleneck}`)
    .slice(0, 5)
    .join('\n')

  const prompt = `다음은 연구실 프로젝트 현황입니다.
- 전체 프로젝트: ${projects.length}개
- Red Zone: ${redZone.length}개 (${redZone.map((p) => p.projectCode).join(', ') || '없음'})
- Warning: ${warning.length}개 (${warning.map((p) => p.projectCode).join(', ') || '없음'})
- 주요 병목 사항:\n${bottlenecks || '(없음)'}

위 정보를 바탕으로 교수가 즉시 파악해야 할 핵심 리스크를 한국어 2~3줄로 요약해줘.
Red Zone 과제 중점, 공통 병목 패턴, 예산 위험 과제를 포함해.
단, 숫자나 항목 나열 없이 자연스러운 문장으로만 작성해.`

  const result = await flashModel.generateContent(prompt)
  return result.response.text().trim()
}

// ─── Per-row summaries ────────────────────────────────────────────────────────

export async function summarizeExpenseRow(expense: {
  vendor: string | null
  amount: number
  category: string | null
  isSuspicious: boolean
  createdAt: string
}): Promise<string> {
  const prompt = `다음 지출 영수증 1건을 한국어 1문장으로 간결하게 설명해줘.
- 업체: ${expense.vendor ?? '미상'}
- 금액: ${expense.amount.toLocaleString()}원
- 카테고리: ${expense.category ?? '미분류'}
- 의심 여부: ${expense.isSuspicious ? '의심' : '정상'}
- 날짜: ${expense.createdAt.slice(0, 10)}

설명만 반환하고, 다른 내용은 쓰지 마.`

  const result = await flashModel.generateContent(prompt)
  return result.response.text().trim()
}

export async function summarizeProjectRow(project: {
  projectCode: string
  projectName: string | null
  status: string
  bottleneck: string | null
  riskScore: number | null
  budgetTotal: number | null
  budgetUsed: number | null
}): Promise<string> {
  const budgetPct =
    project.budgetTotal && project.budgetUsed
      ? Math.round((project.budgetUsed / project.budgetTotal) * 100)
      : null

  const statusLabel =
    project.status === 'red_zone' ? 'Red Zone' :
    project.status === 'warning' ? 'Warning' : 'On Track'

  const prompt = `다음 연구 과제 현황을 한국어 1~2문장으로 요약해줘.
- 과제코드: ${project.projectCode}
- 프로젝트명: ${project.projectName ?? '미정'}
- 상태: ${statusLabel}
- 위험도: ${project.riskScore ?? '?'}/100
- 병목: ${project.bottleneck ?? '없음'}
- 예산 사용률: ${budgetPct !== null ? `${budgetPct}%` : '정보 없음'}

교수가 이 과제에서 주목해야 할 핵심 사항만 요약해. 설명만 반환하고 다른 내용은 쓰지 마.`

  const result = await flashModel.generateContent(prompt)
  return result.response.text().trim()
}

// ─── Main pipeline entry ──────────────────────────────────────────────────────

export async function processFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ type: FileType; data: ReportData | ExpenseData }> {
  const type = await detectFileType(fileBuffer, mimeType)

  if (type === 'report') {
    const data = await parseReport(fileBuffer, mimeType)
    return { type, data }
  }

  if (type === 'expense') {
    const data = await parseExpense(fileBuffer, mimeType)
    return { type, data }
  }

  // unknown — return a minimal report with OUT_OF_SCOPE
  return {
    type,
    data: {
      project_code: null,
      project_name: null,
      student_name: null,
      report_date: null,
      week_label: null,
      summary: '',
      progress: null,
      progress_estimated: false,
      bottleneck: null,
      next_plan: null,
      ai_analysis: null,
      risk_score: 'green' as const,
      error_code: 'OUT_OF_SCOPE' as const,
    },
  }
}
