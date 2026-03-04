'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { createProjectAction } from './actions'
import CategorySelect from '@/app/(app)/components/CategorySelect'
import type { UserProfile } from '@/lib/supabase'

interface BudgetItem {
  category: string
  amount: string
}

interface Props {
  approvedStudents: UserProfile[]
}

export default function ProjectCreateForm({ approvedStudents }: Props) {
  const [state, formAction, isPending] = useActionState(createProjectAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [selectedLeads, setSelectedLeads] = useState<UserProfile[]>([])

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
      setBudgetItems([])
      setSelectedLeads([])
    }
  }, [state])

  const addBudgetItem = () => {
    setBudgetItems((prev) => [...prev, { category: '', amount: '' }])
  }

  const removeBudgetItem = (idx: number) => {
    setBudgetItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateBudgetItem = (idx: number, field: keyof BudgetItem, value: string) => {
    setBudgetItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  const totalBudget = budgetItems.reduce((sum, item) => {
    const n = parseInt(item.amount.replace(/,/g, ''), 10)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const remaining = approvedStudents.filter((s) => !selectedLeads.find((l) => l.id === s.id))

  const handleSubmit = () => {
    // Inject budget_items as JSON hidden input before submit
    const existing = formRef.current?.querySelector('input[name="budget_items"]')
    if (existing) existing.remove()

    const valid = budgetItems.filter((b) => b.category.trim() && b.amount.trim())
    if (valid.length > 0) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'budget_items'
      input.value = JSON.stringify(valid.map((b) => ({
        category: b.category.trim(),
        allocatedAmount: parseInt(b.amount.replace(/,/g, ''), 10) || 0,
      })))
      formRef.current?.appendChild(input)
    }

    // Inject lead_ids as JSON hidden input
    const existingLeads = formRef.current?.querySelector('input[name="lead_ids"]')
    if (existingLeads) existingLeads.remove()

    const leadsInput = document.createElement('input')
    leadsInput.type = 'hidden'
    leadsInput.name = 'lead_ids'
    leadsInput.value = JSON.stringify(selectedLeads.map((l) => l.id))
    formRef.current?.appendChild(leadsInput)
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="bg-deep-navy-light border border-white/10 rounded-xl p-5 mb-6 space-y-4"
    >
      {/* 기본 정보 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">과제코드 *</label>
          <input
            type="text"
            name="project_code"
            placeholder="AI-2024-01"
            required
            maxLength={50}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50 w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">프로젝트명 (선택)</label>
          <input
            type="text"
            name="project_name"
            placeholder="자연어 처리 연구"
            maxLength={100}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">법인카드 끝 4자리</label>
          <input
            type="text"
            name="card_last4"
            placeholder="1234"
            maxLength={4}
            pattern="[0-9]{4}"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50 w-28"
          />
        </div>
      </div>

      {/* 담당자 드롭다운 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-white/40 text-xs">담당자 (선택)</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedLeads.map((l) => (
            <span
              key={l.id}
              className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-white/80 text-xs"
            >
              {l.name}
              <button
                type="button"
                onClick={() => setSelectedLeads((prev) => prev.filter((x) => x.id !== l.id))}
                className="text-white/40 hover:text-white/80"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {remaining.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const s = approvedStudents.find((x) => x.id === e.target.value)
                if (s) setSelectedLeads((prev) => [...prev, s])
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs focus:outline-none"
            >
              <option value="">+ 추가</option>
              {remaining.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {approvedStudents.length === 0 && (
            <span className="text-white/30 text-xs">승인된 학생이 없습니다</span>
          )}
        </div>
      </div>

      {/* 기간 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">시작일</label>
          <input
            type="date"
            name="start_date"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">종료일</label>
          <input
            type="date"
            name="end_date"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
          />
        </div>
      </div>

      {/* 예산 항목 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs">예산 항목 (선택)</span>
          {totalBudget > 0 && (
            <span className="text-white/40 text-xs">총 {totalBudget.toLocaleString()}원</span>
          )}
        </div>
        <div className="space-y-2">
          {budgetItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CategorySelect
                value={item.category}
                onChange={(val) => updateBudgetItem(idx, 'category', val)}
              />
              <input
                type="text"
                placeholder="5,000,000"
                value={item.amount}
                onChange={(e) => updateBudgetItem(idx, 'amount', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 w-36"
              />
              <span className="text-white/30 text-sm">원</span>
              <button
                type="button"
                onClick={() => removeBudgetItem(idx)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBudgetItem}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            항목 추가
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isPending ? '생성 중...' : '프로젝트 생성'}
        </button>
        {state?.ok && (
          <span className="text-green-400 text-sm">✓ {state.projectCode} 생성됨</span>
        )}
        {state?.error && (
          <span className="text-red-400 text-sm">{state.error}</span>
        )}
      </div>
    </form>
  )
}
