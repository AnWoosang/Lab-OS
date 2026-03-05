'use client'

import { useActionState, useRef, useEffect, useState, FormEvent, startTransition } from 'react'
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

const formatAmount = (val: string) => {
  const digits = val.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString() : ''
}

export default function ProjectCreateForm({ approvedStudents }: Props) {
  const [state, formAction, isPending] = useActionState(createProjectAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [selectedLeads, setSelectedLeads] = useState<UserProfile[]>([])
  const [freeTextLeads, setFreeTextLeads] = useState<string[]>([])
  const [freeLeadInput, setFreeLeadInput] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
      setBudgetItems([])
      setSelectedLeads([])
      setFreeTextLeads([])
      setFreeLeadInput('')
      setFieldErrors({})
    }
  }, [state])

  const addBudgetItem = () => setBudgetItems((prev) => [...prev, { category: '', amount: '' }])
  const removeBudgetItem = (idx: number) => setBudgetItems((prev) => prev.filter((_, i) => i !== idx))
  const updateBudgetItem = (idx: number, field: keyof BudgetItem, value: string) =>
    setBudgetItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))

  const totalBudget = budgetItems.reduce((sum, item) => {
    const n = parseInt(item.amount.replace(/,/g, ''), 10)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const remaining = approvedStudents.filter((s) => !selectedLeads.find((l) => l.id === s.id))

  const budgetItemsForServer = budgetItems
    .filter((b) => b.category.trim() && b.amount.trim())
    .map((b) => ({
      category: b.category.trim(),
      allocatedAmount: parseInt(b.amount.replace(/,/g, ''), 10) || 0,
    }))

  const clearError = (key: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next })

  const handleAddFreeLead = () => {
    const trimmed = freeLeadInput.trim()
    if (trimmed) {
      setFreeTextLeads((prev) => [...prev, trimmed])
      setFreeLeadInput('')
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const errors: Record<string, string> = {}

    const code = (fd.get('project_code') as string).trim()
    if (!code) errors.project_code = '과제코드를 입력해주세요.'
    else if (!/^[A-Za-z0-9\-_]+$/.test(code)) errors.project_code = '영문, 숫자, 하이픈(-)만 사용할 수 있습니다.'

    const projectName = (fd.get('project_name') as string).trim()
    if (!projectName) errors.project_name = '프로젝트명을 입력해주세요.'

    if (selectedLeads.length === 0 && freeTextLeads.length === 0) {
      errors.leads = '담당자를 1명 이상 추가해주세요.'
    }

    const card = (fd.get('card_last4') as string).trim()
    if (card && !/^\d{4}$/.test(card)) errors.card_last4 = '카드 번호는 숫자 4자리여야 합니다.'

    const start = fd.get('start_date') as string
    const end = fd.get('end_date') as string
    if (start && end && start > end) errors.end_date = '종료일은 시작일 이후여야 합니다.'

    budgetItems.forEach((item, idx) => {
      if (item.category && !item.amount.trim()) errors[`budget_amount_${idx}`] = '금액을 입력해주세요.'
      if (!item.category && item.amount.trim()) errors[`budget_category_${idx}`] = '카테고리를 선택해주세요.'
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    startTransition(() => formAction(fd))
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-deep-navy-light border border-white/10 rounded-xl p-5 mb-6 space-y-4"
    >
      {/* JSX hidden inputs */}
      <input type="hidden" name="budget_items" value={JSON.stringify(budgetItemsForServer)} />
      <input type="hidden" name="lead_ids" value={JSON.stringify(selectedLeads.map((l) => l.id))} />
      <input type="hidden" name="free_lead_names" value={JSON.stringify(freeTextLeads)} />

      {/* 기본 정보 */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">과제코드 *</label>
          <input
            type="text"
            name="project_code"
            placeholder="AI-2024-01"
            maxLength={50}
            onChange={() => clearError('project_code')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50 w-36"
          />
          {fieldErrors.project_code && (
            <span className="text-red-400 text-xs mt-0.5">{fieldErrors.project_code}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">프로젝트명 *</label>
          <input
            type="text"
            name="project_name"
            placeholder="자연어 처리 연구"
            maxLength={100}
            onChange={() => clearError('project_name')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 w-48"
          />
          {fieldErrors.project_name && (
            <span className="text-red-400 text-xs mt-0.5">{fieldErrors.project_name}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/40 text-xs">법인카드 끝 4자리</label>
          <input
            type="text"
            name="card_last4"
            placeholder="1234"
            maxLength={4}
            onChange={() => clearError('card_last4')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50 w-28"
          />
          {fieldErrors.card_last4 && (
            <span className="text-red-400 text-xs mt-0.5">{fieldErrors.card_last4}</span>
          )}
        </div>
      </div>

      {/* 담당자 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-white/40 text-xs">담당자 *</label>
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
          {freeTextLeads.map((name, i) => (
            <span
              key={`free-${i}`}
              className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-white/80 text-xs"
            >
              {name}
              <button
                type="button"
                onClick={() => setFreeTextLeads((prev) => prev.filter((_, j) => j !== i))}
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
                if (s) { setSelectedLeads((prev) => [...prev, s]); clearError('leads') }
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs focus:outline-none"
            >
              <option value="">+ 학생 추가</option>
              {remaining.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {approvedStudents.length === 0 && (
            <span className="text-white/30 text-xs">승인된 학생이 없습니다</span>
          )}
        </div>
        {/* 외부 담당자 자유 기입 */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={freeLeadInput}
            onChange={(e) => setFreeLeadInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleAddFreeLead() }
            }}
            placeholder="외부 담당자 이름"
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs placeholder-white/20 focus:outline-none focus:border-primary/50 w-32"
          />
          <button
            type="button"
            onClick={() => { handleAddFreeLead(); clearError('leads') }}
            className="text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            추가
          </button>
        </div>
        {fieldErrors.leads && (
          <span className="text-red-400 text-xs">{fieldErrors.leads}</span>
        )}
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
            onChange={() => clearError('end_date')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
          />
          {fieldErrors.end_date && (
            <span className="text-red-400 text-xs mt-0.5">{fieldErrors.end_date}</span>
          )}
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
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <CategorySelect
                  value={item.category}
                  onChange={(val) => {
                    updateBudgetItem(idx, 'category', val)
                    clearError(`budget_category_${idx}`)
                  }}
                />
                <input
                  type="text"
                  placeholder="5,000,000"
                  value={item.amount}
                  onChange={(e) => {
                    updateBudgetItem(idx, 'amount', formatAmount(e.target.value))
                    clearError(`budget_amount_${idx}`)
                  }}
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
              {fieldErrors[`budget_amount_${idx}`] && (
                <span className="text-red-400 text-xs ml-1">{fieldErrors[`budget_amount_${idx}`]}</span>
              )}
              {fieldErrors[`budget_category_${idx}`] && (
                <span className="text-red-400 text-xs ml-1">{fieldErrors[`budget_category_${idx}`]}</span>
              )}
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
