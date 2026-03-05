'use client'

import { Sparkles, AlertTriangle, Zap, BarChart2, GitBranch, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from '@/app/components/ui/dialog'
import { StatusBadge } from './StatusBadge'

interface ReportData {
  projectCode: string
  projectName: string | null
  reportDate: string | null
  createdAt: string
  bottleneck: string | null
  nextPlan: string | null
  aiAnalysis: string | null
}

interface Props {
  report: ReportData
}

// ─── Section parser ────────────────────────────────────────────────────────────

function parseSections(text: string): { title: string; content: string }[] {
  const chunks = text.split(/\n(?=## )/)
  return chunks
    .map((chunk) => {
      const nl = chunk.indexOf('\n')
      if (nl === -1) return null
      return {
        title: chunk.slice(0, nl).replace(/^## /, '').trim(),
        content: chunk.slice(nl + 1).trim(),
      }
    })
    .filter((s): s is { title: string; content: string } => !!s?.title && !!s?.content)
}

const SECTION_STYLES: Record<string, { icon: React.ElementType; card: string; text: string }> = {
  핵심요약: { icon: Zap,          card: 'bg-blue-500/10 border-blue-500/25',   text: 'text-blue-200/90' },
  연구활동: { icon: BarChart2,    card: 'bg-white/5 border-white/10',          text: 'text-white/80' },
  진도평가: { icon: BarChart2,    card: 'bg-white/5 border-white/10',          text: 'text-white/80' },
  리스크분석: { icon: AlertTriangle, card: 'bg-amber-500/5 border-amber-500/20', text: 'text-amber-200/80' },
  병목분석: { icon: GitBranch,    card: 'bg-orange-500/5 border-orange-500/20', text: 'text-orange-200/80' },
  검토포인트: { icon: CheckCircle2, card: 'bg-green-500/5 border-green-500/20', text: 'text-green-200/80' },
}

function getSectionStyle(title: string) {
  const key = title.replace(/\s/g, '')
  return SECTION_STYLES[key] ?? { icon: Sparkles, card: 'bg-white/5 border-white/10', text: 'text-white/80' }
}

const CIRCLED_NUMS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨']

function parseNumberedItems(text: string): { num: string; body: string }[] | null {
  const items: { num: string; body: string }[] = []
  let current: { num: string; lines: string[] } | null = null

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (CIRCLED_NUMS.includes(trimmed.charAt(0))) {
      if (current) items.push({ num: current.num, body: current.lines.join(' ').trim() })
      current = { num: trimmed.charAt(0), lines: [trimmed.slice(1).trim()] }
    } else if (current) {
      current.lines.push(trimmed)
    }
  }
  if (current) items.push({ num: current.num, body: current.lines.join(' ').trim() })

  return items.length >= 2 ? items : null
}

function SectionCards({ text }: { text: string }) {
  const sections = parseSections(text)
  if (sections.length === 0) {
    return (
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4">
        <p className="text-blue-100/80 text-sm leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {sections.map(({ title, content }) => {
        const style = getSectionStyle(title)
        const Icon = style.icon
        return (
          <div key={title} className={`border rounded-lg p-4 ${style.card}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${style.text}`} />
              <p className={`text-sm font-semibold tracking-wide ${style.text}`}>{title}</p>
            </div>
            {(() => {
              const items = parseNumberedItems(content)
              if (items) {
                return (
                  <ol className="space-y-3">
                    {items.map(({ num, body }) => (
                      <li key={num} className="flex gap-3">
                        <span className={`text-xs font-bold flex-shrink-0 w-4 mt-0.5 ${style.text} opacity-60`}>
                          {num}
                        </span>
                        <p className={`text-sm leading-relaxed ${style.text}`}>{body}</p>
                      </li>
                    ))}
                  </ol>
                )
              }
              return <p className={`text-sm leading-relaxed whitespace-pre-line ${style.text}`}>{content}</p>
            })()}
          </div>
        )
      })}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportSummaryModal({ report }: Props) {
  const status = report.bottleneck ? 'warning' : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-primary/60 hover:text-primary text-xs transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          상세 요약 보기
        </button>
      </DialogTrigger>

      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <div>
            <DialogTitle>{report.projectCode}</DialogTitle>
            {report.projectName && (
              <p className="text-white/50 text-xs mt-0.5">{report.projectName}</p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            <span className="text-white/40 text-xs font-mono whitespace-nowrap">
              {report.reportDate ?? report.createdAt.slice(0, 10)}
            </span>
            <DialogCloseButton />
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {status && (
            <div className="flex justify-end">
              <StatusBadge status={status} />
            </div>
          )}

          {/* Next Plan */}
          {report.nextPlan && (
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-2">다음 계획</p>
              <p className="text-white/80 text-sm leading-relaxed bg-white/5 rounded-lg p-4">{report.nextPlan}</p>
            </div>
          )}

          {/* Bottleneck */}
          {report.bottleneck && (
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-2">병목 사항</p>
              <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200/80 text-sm leading-relaxed">{report.bottleneck}</p>
              </div>
            </div>
          )}

          {/* AI 상세 분석 */}
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-3">AI 상세 분석</p>
            {report.aiAnalysis
              ? <SectionCards text={report.aiAnalysis} />
              : (
                <div className="text-white/25 text-xs text-center py-6 bg-white/3 rounded-lg border border-white/5">
                  분석 데이터가 없습니다.
                </div>
              )
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
