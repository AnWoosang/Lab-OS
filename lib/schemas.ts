import { z } from 'zod'

// ─── Report (주간 보고서) ──────────────────────────────────────────────────────

export const ReportSchema = z.object({
  project_code: z.string().nullable(),
  project_name: z.string().nullable(),
  student_name: z.string().nullable(),
  report_date: z.string().nullable(),       // "YYYY-MM-DD"
  week_label: z.string().nullable(),         // 예: "2025년 2월 3주차"
  summary: z.string(),
  progress: z.number().min(0).max(100).nullable(),
  progress_estimated: z.boolean(),
  bottleneck: z.string().nullable(),
  next_plan: z.string().nullable(),
  risk_score: z.enum(['red', 'yellow', 'green']),
  error_code: z.enum(['OUT_OF_SCOPE', 'UNREADABLE_FILE']).nullable(),
})

export type ReportData = z.infer<typeof ReportSchema>

// ─── Expense (영수증) ─────────────────────────────────────────────────────────

export const ExpenseItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
})

export const ExpenseSchema = z.object({
  vendor: z.string().nullable(),
  receipt_date: z.string().nullable(),       // "YYYY-MM-DD"
  total_amount: z.number().nullable(),
  currency: z.enum(['KRW', 'USD', 'OTHER']),
  items: z.array(ExpenseItemSchema),
  category: z.string(),
  budget_code: z.string(),
  card_last4: z.string().regex(/^\d{4}$/).nullable(),
  is_suspicious: z.boolean(),
  suspicious_reason: z.string().nullable(),
  error_code: z.enum(['OUT_OF_SCOPE', 'UNREADABLE_FILE']).nullable(),
})

export type ExpenseData = z.infer<typeof ExpenseSchema>

// ─── File type detection ──────────────────────────────────────────────────────

export type FileType = 'report' | 'expense' | 'unknown'

// ─── Slack event ─────────────────────────────────────────────────────────────

export interface SlackFileSharedEvent {
  type: 'file_shared'
  file_id: string
  user_id: string
  file: {
    id: string
    name: string
    mimetype: string
    url_private_download: string
    permalink: string
  }
  channel_id: string
  event_ts: string
}
