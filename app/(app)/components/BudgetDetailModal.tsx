'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog'
import { getBudgetDetailAction } from '@/app/(app)/projects/actions'
import BudgetCategoryRow from './BudgetCategoryRow'
import { LoadingSpinner } from './LoadingSpinner'
import type { BudgetSummaryItem, ExpenseRow } from '@/lib/db'

interface Props {
  projectId: string
  projectName: string | null
}

export default function BudgetDetailModal({ projectId, projectName }: Props) {
  const [data, setData] = useState<{ budgetSummary: BudgetSummaryItem[]; expenses: ExpenseRow[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpen = async (open: boolean) => {
    if (open && !data) {
      setLoading(true)
      try {
        const result = await getBudgetDetailAction(projectId)
        setData(result)
      } finally {
        setLoading(false)
      }
    }
  }

  const expensesByCategory = data
    ? data.expenses.reduce<Record<string, ExpenseRow[]>>((acc, e) => {
        const key = e.budgetCategory ?? '미분류'
        acc[key] = [...(acc[key] ?? []), e]
        return acc
      }, {})
    : {}

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-0.5 text-white/40 hover:text-white/70 text-xs transition-colors mt-1">
          상세
          <ChevronRight className="w-3 h-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projectName ?? '프로젝트'} — 예산 상세</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {data && (
          <div className="divide-y divide-white/5">
            {data.budgetSummary.length === 0 ? (
              <p className="py-6 text-center text-white/30 text-sm">예산 항목 미설정</p>
            ) : (
              data.budgetSummary.map((item) => (
                <BudgetCategoryRow
                  key={item.category}
                  item={item}
                  expenses={expensesByCategory[item.category] ?? []}
                />
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
