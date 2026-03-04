'use client'

import { useState, useEffect, useRef, useActionState } from 'react'
import { Pencil, Trash2, Check, X, Plus, Loader2 } from 'lucide-react'
import { updateProjectMetaAction, deleteProjectAction, toggleProjectCompletedAction, getProjectBudgetsAction } from './actions'
import CategorySelect from '@/app/(app)/components/CategorySelect'
import { StatusDot } from '@/app/(app)/components/StatusBadge'
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


function fmtKRW(n: number): string {
  if (Math.abs(n) >= 10000) return `${Math.round(n / 10000).toLocaleString()}만원`
  return `${n.toLocaleString()}원`
}

export default function ProjectManageRow({ project, workspaceId: _workspaceId, approvedStudents, leads }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [selectedLeads, setSelectedLeads] = useState<UserProfile[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  const [editState, editAction, editPending] = useActionState(updateProjectMetaAction, null)

  useEffect(() => {
    if (editState?.ok) setIsEditing(false)
  }, [editState])

  const handleEditClick = async () => {
    setLoadingEdit(true)
    try {
      const existing = await getProjectBudgetsAction(project.id)
      setBudgetItems(
        existing.map((b) => ({ category: b.category, amount: String(b.allocatedAmount) }))
      )
      setSelectedLeads(leads)
    } finally {
      setLoadingEdit(false)
      setIsEditing(true)
    }
  }

  const handleSubmit = () => {
    // Inject budget_items hidden input
    const existingBudget = formRef.current?.querySelector('input[name="budget_items"]')
    if (existingBudget) existingBudget.remove()
    const valid = budgetItems.filter((b) => b.category.trim() && b.amount.trim())
    const budgetInput = document.createElement('input')
    budgetInput.type = 'hidden'
    budgetInput.name = 'budget_items'
    budgetInput.value = JSON.stringify(
      valid.map((b) => ({
        category: b.category.trim(),
        allocatedAmount: parseInt(b.amount.replace(/,/g, ''), 10) || 0,
      }))
    )
    formRef.current?.appendChild(budgetInput)

    // Inject lead_user_ids hidden input
    const existingLeads = formRef.current?.querySelector('input[name="lead_user_ids"]')
    if (existingLeads) existingLeads.remove()
    const leadsInput = document.createElement('input')
    leadsInput.type = 'hidden'
    leadsInput.name = 'lead_user_ids'
    leadsInput.value = JSON.stringify(selectedLeads.map((l) => l.id))
    formRef.current?.appendChild(leadsInput)
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

  if (isEditing) {
    return (
      <tr className="border-b border-white/5 bg-white/3">
        <td colSpan={7} className="px-5 py-4">
          <form ref={formRef} action={editAction} onSubmit={handleSubmit} className="space-y-3">
            <input type="hidden" name="projectId" value={project.id} />

            {/* Row 1: 과제코드 + 프로젝트명 */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                name="projectCode"
                defaultValue={project.projectCode}
                placeholder="과제코드"
                maxLength={50}
                required
                className="w-32 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-primary/50"
              />
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
              <input
                type="text"
                name="cardLast4"
                defaultValue={project.cardLast4 ?? ''}
                placeholder="법인카드 끝 4자리"
                maxLength={4}
                pattern="\d{4}"
                className="w-36 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Row 3: 기간 */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                name="startDate"
                defaultValue={project.startDate ?? ''}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
              />
              <span className="text-white/30 text-sm">~</span>
              <input
                type="date"
                name="endDate"
                defaultValue={project.endDate ?? ''}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 w-40"
              />
            </div>

            {/* Row 4: 담당자 멀티셀렉트 */}
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
                  <div key={idx} className="flex items-center gap-2">
                    <CategorySelect
                      value={item.category}
                      onChange={(val) => updateItem(idx, 'category', val)}
                    />
                    <input
                      type="text"
                      placeholder="금액"
                      value={item.amount}
                      onChange={(e) => updateItem(idx, 'amount', e.target.value)}
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

  const budgetUsed = project.budgetUsed ?? 0
  const budgetTotal = project.budgetTotal
  const budgetPct = budgetTotal ? Math.min(Math.round((budgetUsed / budgetTotal) * 100), 100) : null
  const budgetRemaining = budgetTotal != null ? budgetTotal - budgetUsed : null
  const barColor = budgetPct == null ? '' : budgetPct > 80 ? 'bg-red-400' : budgetPct > 60 ? 'bg-amber-400' : 'bg-green-400'

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
        {budgetTotal == null ? (
          <span className="text-white/30 text-sm">—</span>
        ) : (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-full h-1 w-20 flex-shrink-0">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${budgetPct}%` }} />
              </div>
              <span className="text-white/50 text-xs font-mono">{budgetPct}%</span>
            </div>
            <p className="text-white/40 text-xs font-mono whitespace-nowrap">
              {fmtKRW(budgetUsed)} / {fmtKRW(budgetTotal)}
            </p>
            <p className={`text-xs font-mono whitespace-nowrap ${budgetRemaining != null && budgetRemaining < 0 ? 'text-red-400' : 'text-white/30'}`}>
              잔여 {budgetRemaining != null ? fmtKRW(budgetRemaining) : '—'}
            </p>
          </div>
        )}
      </td>

      {/* 상태 */}
      <td className="px-5 py-3">
        <StatusDot status={project.status} />
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
