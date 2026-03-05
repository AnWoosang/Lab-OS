'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { BudgetSummaryItem, ExpenseRow } from '@/lib/db'

interface Props {
  item: BudgetSummaryItem
  expenses: ExpenseRow[]
}

export default function BudgetCategoryRow({ item, expenses }: Props) {
  const [open, setOpen] = useState(false)

  const pct = item.allocatedAmount > 0
    ? Math.round((item.usedAmount / item.allocatedAmount) * 100)
    : 0

  const barColor = pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400'
  const pctColor = pct > 80 ? 'text-red-400' : pct > 50 ? 'text-amber-400' : 'text-green-400'

  return (
    <div className="px-5 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">{item.category}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-semibold ${pctColor}`}>{pct}%</span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-white/40 hover:text-white/70 transition-colors"
            aria-label={open ? '접기' : '펼치기'}
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Budget numbers */}
      <div className="grid grid-cols-3 gap-2 text-xs text-white/40">
        <div>
          <p className="mb-0.5">배정</p>
          <p className="text-white/70 font-mono">{item.allocatedAmount.toLocaleString()}원</p>
        </div>
        <div>
          <p className="mb-0.5">사용</p>
          <p className="text-white/70 font-mono">{item.usedAmount.toLocaleString()}원</p>
        </div>
        <div>
          <p className="mb-0.5">잔여</p>
          <p className={`font-mono ${item.remaining < 0 ? 'text-red-400' : 'text-white/70'}`}>
            {item.remaining.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* Accordion: expense list */}
      {open && (
        <div className="mt-3 rounded-lg border border-white/10 overflow-hidden">
          {expenses.length === 0 ? (
            <p className="px-4 py-3 text-white/30 text-xs text-center">지출 내역 없음</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="px-3 py-2 text-left font-normal">날짜</th>
                  <th className="px-3 py-2 text-left font-normal">업체</th>
                  <th className="px-3 py-2 text-right font-normal">금액</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 text-white/50 font-mono">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '—'}
                    </td>
                    <td className="px-3 py-2 text-white/80">
                      <span className="flex items-center gap-1">
                        {e.vendor ?? '—'}
                        {e.isSuspicious && (
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-white/70 font-mono">
                      {e.amount.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
