'use client'

import { useState, useTransition } from 'react'
import { updateExpenseBudgetCategoryAction } from '@/app/(app)/lab/actions'
import CategorySelect from '@/app/(app)/components/CategorySelect'

interface Props {
  expenseId: string
  budgetCategory: string | null
}

export default function BudgetCategoryCell({ expenseId, budgetCategory }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(budgetCategory ?? '')
  const [saved, setSaved] = useState(budgetCategory)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const finalValue = value.trim() || null
      await updateExpenseBudgetCategoryAction(expenseId, finalValue)
      setSaved(finalValue)
      setEditing(false)
    })
  }

  const handleCancel = () => {
    setValue(saved ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <CategorySelect value={value} onChange={setValue} placeholder="항목 선택" />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-2 py-1 rounded bg-primary/20 text-primary text-xs border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : '저장'}
        </button>
        <button
          onClick={handleCancel}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left group"
      title="클릭하여 수정"
    >
      {saved ? (
        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs group-hover:bg-primary/25 transition-colors">
          {saved}
        </span>
      ) : (
        <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">—</span>
      )}
    </button>
  )
}
