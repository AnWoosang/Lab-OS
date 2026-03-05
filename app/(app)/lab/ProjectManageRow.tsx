'use client'

import { useState, useEffect, useRef, useActionState, FormEvent, startTransition } from 'react'
import { Pencil, Trash2, Check, X, Plus, Loader2 } from 'lucide-react'
import { updateProjectMetaAction, deleteProjectAction, toggleProjectCompletedAction, getProjectBudgetsAction, getProjectFreeLeadsAction } from './actions'
import CategorySelect from '@/app/(app)/components/CategorySelect'
import { BudgetBar } from '@/app/(app)/components/BudgetBar'
import BudgetDetailModal from '@/app/(app)/components/BudgetDetailModal'
import type { ProjectRow } from '@/lib/db'
import type { UserProfile } from '@/lib/supabase'

interface Props {
  project: ProjectRow
  workspaceId: string
  approvedStudents: UserProfile[]
  leads: UserProfile[]
}

interface BudgetItem {
  category: string
  amount: string
}

const formatAmount = (val: string) => {
  const digits = val.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString() : ''
}

export default function ProjectManageRow({ project, workspaceId: _workspaceId, approvedStudents, leads }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [selectedLeads, setSelectedLeads] = useState<UserProfile[]>([])
  const [freeTextLeads, setFreeTextLeads] = useState<string[]>([])
  const [freeLeadInput, setFreeLeadInput] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  const [editState, editAction, editPending] = useActionState(updateProjectMetaAction, null)

  useEffect(() => {
    if (editState?.ok) setIsEditing(false)
  }, [editState])

  const handleEditClick = async () => {
    setLoadingEdit(true)
    try {
      const [existing, freeLeads] = await Promise.all([
        getProjectBudgetsAction(project.id),
        getProjectFreeLeadsAction(project.id),
      ])
      setBudgetItems(
        existing.map((b) => ({ category: b.category, amount: String(b.allocatedAmount) }))
      )
      setSelectedLeads(leads)
      setFreeTextLeads(freeLeads)
    } finally {
      setLoadingEdit(false)
      setIsEditing(true)
    }
  }

  const addBudgetItem = () => setBudgetItems((prev) => [...prev, { category: '', amount: '' }])
  const removeBudgetItem = (idx: number) => setBudgetItems((prev) => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof BudgetItem, value: string) =>
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

    const code = (fd.get('projectCode') as string).trim()
    if (!code) errors.projectCode = '과제코드를 입력해주세요.'
    else if (!/^[A-Za-z0-9\-_]+$/.test(code)) errors.projectCode = '영문, 숫자, 하이픈(-)만 사용할 수 있습니다.'

    const card = (fd.get('cardLast4') as string).trim()
    if (card && !/^\d{4}$/.test(card)) errors.cardLast4 = '카드 번호는 숫자 4자리여야 합니다.'

    const start = fd.get('startDate') as string
    const end = fd.get('endDate') as string
    if (start && end && start > end) errors.endDate = '종료일은 시작일 이후여야 합니다.'

    budgetItems.forEach((item, idx) => {
      if (item.category && !item.amount.trim()) errors[`budget_amount_${idx}`] = '금액을 입력해주세요.'
      if (!item.category && item.amount.trim()) errors[`budget_category_${idx}`] = '카테고리를 선택해주세요.'
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    startTransition(() => editAction(fd))
  }

  if (isEditing) {
    return (
      <tr className="border-b border-white/5 bg-white/3">
        <td colSpan={6} className="px-5 py-4">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            {/* JSX hidden inputs */}
            <input type="hidden" name="budget_items" value={JSON.stringify(budgetItemsForServer)} />
            <input type="hidden" name="lead_user_ids" value={JSON.stringify(selectedLeads.map((l) => l.id))} />
            <input type="hidden" name="free_lead_names" value={JSON.stringify(freeTextLeads)} />

            {/* Row 1: 과제코드 + 프로젝트명 */}
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col gap-0.5">
                <input
                  type="text"
                  name="projectCode"
                  defaultValue={project.projectCode}
                  placeholder="과제코드"
                  maxLength={50}
                  onChange={() => clearError('projectCode')}
                  className="w-32 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-primary/50"
                />
                {fieldErrors.projectCode && (
                  <span className="text-red-400 text-xs">{fieldErrors.projectCode}</span>
                )}
              </div>
              <input
                type="text"
                name="projectName"
                defaultValue={project.projectName ?? ''}
                placeholder="프로젝트명"
                className="flex-1 min-w-40 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Row 2: 법인카드 */}
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col gap-0.5">
                <input
                  type="text"
                  name="cardLast4"
                  defaultValue={project.cardLast4 ?? ''}
                  placeholder="법인카드 끝 4자리"
                  maxLength={4}
                  onChange={() => clearError('cardLast4')}
                  className="w-36 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-primary/50"
                />
                {fieldErrors.cardLast4 && (
                  <span className="text-red-400 text-xs">{fieldErrors.cardLast4}</span>
                )}
              </div>
            </div>

            {/* Row 3: 기간 */}
            <div className="flex flex-wrap gap-2 items-start">
              <input
                type="date"
                name="startDate"
                defaultValue={project.startDate ?? ''}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
              />
              <span className="text-white/30 text-sm mt-1.5">~</span>
              <div className="flex flex-col gap-0.5">
                <input
                  type="date"
                  name="endDate"
                  defaultValue={project.endDate ?? ''}
                  onChange={() => clearError('endDate')}
                  className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
                />
                {fieldErrors.endDate && (
                  <span className="text-red-400 text-xs">{fieldErrors.endDate}</span>
                )}
              </div>
            </div>

            {/* Row 4: 담당자 */}
            <div>
              <span className="text-white/40 text-xs block mb-1.5">담당자</span>
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
                      if (s) setSelectedLeads((prev) => [...prev, s])
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs focus:outline-none"
                  >
                    <option value="">+ 학생 추가</option>
                    {remaining.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {/* 외부 담당자 자유 기입 */}
              <div className="flex items-center gap-1.5 mt-1.5">
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
                  onClick={handleAddFreeLead}
                  className="text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Row 5: 예산 항목 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs">예산 항목</span>
                {totalBudget > 0 && (
                  <span className="text-white/40 text-xs">총 {totalBudget.toLocaleString()}원</span>
                )}
              </div>
              <div className="space-y-1.5">
                {budgetItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <CategorySelect
                        value={item.category}
                        onChange={(val) => {
                          updateItem(idx, 'category', val)
                          clearError(`budget_category_${idx}`)
                        }}
                      />
                      <input
                        type="text"
                        placeholder="금액"
                        value={item.amount}
                        onChange={(e) => {
                          updateItem(idx, 'amount', formatAmount(e.target.value))
                          clearError(`budget_amount_${idx}`)
                        }}
                        className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                      <span className="text-white/30 text-sm">원</span>
                      <button
                        type="button"
                        onClick={() => removeBudgetItem(idx)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
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
                  className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  항목 추가
                </button>
              </div>
            </div>

            {/* Row 6: Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={editPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editPending ? '저장 중...' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-sm hover:text-white/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  취소
                </button>
              </div>
              {editState?.error && <span className="text-red-400 text-xs">{editState.error}</span>}
            </div>
          </form>
        </td>
      </tr>
    )
  }

  const leadsText = leads.length > 0 ? leads.map((l) => l.name).join(', ') : '—'
  const periodText =
    project.startDate && project.endDate
      ? `${project.startDate} ~ ${project.endDate}`
      : project.startDate
        ? `${project.startDate} ~`
        : '—'

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      {/* 과제코드 */}
      <td className="px-5 py-3 whitespace-nowrap">
        <span className="text-white/80 font-mono text-sm">{project.projectCode}</span>
      </td>

      {/* 프로젝트명 */}
      <td className="px-5 py-3 max-w-[160px]">
        <span className="text-white text-sm block truncate">{project.projectName || '—'}</span>
      </td>

      {/* 담당자 */}
      <td className="px-5 py-3 whitespace-nowrap">
        <span className="text-white/60 text-sm">{leadsText}</span>
      </td>

      {/* 기간 */}
      <td className="px-5 py-3 whitespace-nowrap">
        <span className="text-white/50 text-xs font-mono">{periodText}</span>
      </td>

      {/* 예산 */}
      <td className="px-5 py-3">
        <BudgetBar used={project.budgetUsed} total={project.budgetTotal} />
        <BudgetDetailModal projectId={project.id} projectName={project.projectName} />
      </td>

      {/* 작업 */}
      <td className="px-5 py-3">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs">삭제할까요?</span>
            <form action={deleteProjectAction} className="inline">
              <input type="hidden" name="projectId" value={project.id} />
              <button type="submit" className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">확인</button>
            </form>
            <button onClick={() => setConfirmDelete(false)} className="text-white/40 hover:text-white/70 text-xs transition-colors">취소</button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleEditClick}
              disabled={loadingEdit}
              className="p-1.5 text-white/30 hover:text-white/70 transition-colors disabled:opacity-50"
              aria-label="편집"
            >
              {loadingEdit ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Pencil className="w-3.5 h-3.5" />
              )}
            </button>

            <form action={toggleProjectCompletedAction} className="inline">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="isCompleted" value={String(project.isCompleted)} />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs rounded-lg border transition-colors text-white/40 border-white/10 hover:border-white/25 hover:text-white/70"
              >
                {project.isCompleted ? '재개' : '완료'}
              </button>
            </form>

            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
              aria-label="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
