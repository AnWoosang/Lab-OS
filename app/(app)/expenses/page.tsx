import Link from 'next/link'
import { Receipt, AlertTriangle, ExternalLink } from 'lucide-react'
import { BarTrack } from '../components/BarTrack'
import { getWorkspaceContext } from '@/lib/workspace-context'
import {
  getAllProjects,
  getAllExpenses,
  getExpensesForProject,
  getBudgetSummary,
  type ExpenseRow,
  type ExpenseWithProject,
} from '@/lib/db'
import { periodToDateRange } from '@/lib/date-filter'
import ProjectFilterTabs from '../components/ProjectFilterTabs'
import PeriodFilterBar from '../components/PeriodFilterBar'
import DateRangePicker from '../components/DateRangePicker'
import AISummaryCard from '../components/AISummaryCard'
import AISummaryCell from '../components/AISummaryCell'
import SortableDateHeader from '../components/SortableDateHeader'
import BudgetCategoryCell from './BudgetCategoryCell'
import DeleteRowButton from '../components/DeleteRowButton'
import { generateExpenseSummaryAction, generateExpenseRowSummaryAction, deleteExpenseAction } from './actions'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; period?: string; order?: string; from?: string; to?: string }>
}) {
  const { workspaceId, profile } = await getWorkspaceContext()
  const { project: projectId, period, order, from, to } = await searchParams

  const dateRange = (from || to)
    ? { from: from ? `${from}T00:00:00` : undefined, to: to ? `${to}T23:59:59` : undefined }
    : periodToDateRange(period)
  const sortOrder: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc'

  const [projects, rawExpenses, budgetSummary] = await Promise.all([
    getAllProjects(workspaceId),
    projectId
      ? getExpensesForProject(projectId, workspaceId)
      : getAllExpenses(workspaceId, 50, { ...dateRange, order: sortOrder }),
    projectId ? getBudgetSummary(projectId, workspaceId) : Promise.resolve([]),
  ])

  const expenses: ExpenseWithProject[] = projectId
    ? (rawExpenses as ExpenseRow[]).map((r) => {
        const proj = projects.find((p) => p.id === projectId)
        return { ...r, projectCode: proj?.projectCode ?? '—', projectName: proj?.projectName ?? null }
      })
    : (rawExpenses as ExpenseWithProject[])

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const suspiciousCount = expenses.filter((e) => e.isSuspicious).length

  const headingText = selectedProject
    ? `${selectedProject.projectCode} 지출 내역`
    : '워크스페이스 전체 지출 내역'

  const isProfessor = profile.role === 'professor'

  // 현재 필터 유지 URL (SortableDateHeader용)
  const filterParams = new URLSearchParams()
  if (projectId) filterParams.set('project', projectId)
  if (period && period !== 'all') filterParams.set('period', period)
  const filterQs = filterParams.toString()
  const basePathWithFilters = filterQs ? `/expenses?${filterQs}` : '/expenses'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">영수증</h1>
        <p className="text-white/50 text-sm mt-1">{headingText} · {expenses.length}건</p>
        <ProjectFilterTabs
          projects={projects}
          selectedId={projectId ?? null}
          basePath="/expenses"
        />
        <PeriodFilterBar
          currentPeriod={period ?? 'all'}
          basePath="/expenses"
          currentProjectId={projectId ?? null}
        />
        <DateRangePicker basePath="/expenses" currentProjectId={projectId ?? null} />
      </div>

      {/* AI Summary */}
      <AISummaryCard summaryAction={generateExpenseSummaryAction} />

      {/* 예산 미설정 placeholder */}
      {selectedProject && budgetSummary.length === 0 && (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 p-4 text-center">
          <p className="text-white/30 text-sm">
            이 프로젝트의 예산 항목이 설정되지 않았습니다.{' '}
            <Link href="/lab?tab=projects" className="text-primary hover:underline">
              내 연구실에서 설정하기
            </Link>
          </p>
        </div>
      )}

      {/* 예산 현황 배너 (프로젝트 선택 시) */}
      {budgetSummary.length > 0 && (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 p-5">
          <h3 className="text-white/60 text-xs font-medium mb-3">예산 현황</h3>
          <div className="space-y-3">
            {budgetSummary.map((item) => {
              const pct = item.allocatedAmount > 0
                ? Math.min(Math.round((item.usedAmount / item.allocatedAmount) * 100), 100)
                : 0
              const isOver = item.remaining < 0
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-medium w-20">{item.category}</span>
                      <span className="text-white/40 text-xs">배정 {item.allocatedAmount.toLocaleString()}원</span>
                      <span className="text-white/40 text-xs">사용 {item.usedAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-medium ${isOver ? 'text-red-400' : 'text-white/70'}`}>
                        잔여 {item.remaining.toLocaleString()}원
                      </span>
                      <span className={`text-xs ${isOver ? 'text-red-400' : 'text-white/40'}`}>{pct}%</span>
                    </div>
                  </div>
                  <BarTrack pct={pct} semantics="budget" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-deep-navy-light rounded-xl p-5 border border-white/10">
          <p className="text-white/50 text-sm mb-1">총 지출액</p>
          <p className="text-white text-2xl font-mono font-bold">
            {totalAmount.toLocaleString()}원
          </p>
        </div>
        <div className={`rounded-xl p-5 border ${suspiciousCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-deep-navy-light border-white/10'}`}>
          <p className={`text-sm mb-1 ${suspiciousCount > 0 ? 'text-red-400/70' : 'text-white/50'}`}>의심 영수증</p>
          <p className={`text-2xl font-mono font-bold ${suspiciousCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {suspiciousCount}건
          </p>
        </div>
        <div className="bg-deep-navy-light rounded-xl p-5 border border-white/10">
          <p className="text-white/50 text-sm mb-1">총 영수증 수</p>
          <p className="text-white text-2xl font-mono font-bold">{expenses.length}건</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 p-16 text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">아직 등록된 영수증이 없습니다.</p>
          <p className="text-white/25 text-xs mt-1">학생이 영수증을 업로드하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3">
                    <SortableDateHeader currentOrder={sortOrder} basePath={basePathWithFilters} />
                  </th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">업체명</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">금액</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">카테고리</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">예산 항목</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">의심</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">파일</th>
                  {isProfessor && (
                    <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[40px]"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={`border-b border-white/5 transition-colors ${
                      expense.isSuspicious
                        ? 'bg-red-500/5 hover:bg-red-500/10'
                        : 'hover:bg-white/3'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className="text-white/60 text-xs font-mono whitespace-nowrap">
                        {expense.createdAt.slice(0, 10)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{expense.projectCode}</p>
                      {expense.projectName && (
                        <p className="text-white/40 text-xs mt-0.5">{expense.projectName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/80 text-sm">{expense.vendor || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-mono text-sm">
                        {expense.amount.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/60 text-sm">{expense.category || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <BudgetCategoryCell
                        expenseId={expense.id}
                        budgetCategory={expense.budgetCategory}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {expense.isSuspicious ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          의심
                        </span>
                      ) : (
                        <span className="text-green-400/60 text-xs">정상</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AISummaryCell
                        generateAction={generateExpenseRowSummaryAction.bind(null, {
                          vendor: expense.vendor,
                          amount: expense.amount,
                          category: expense.category,
                          isSuspicious: expense.isSuspicious,
                          createdAt: expense.createdAt,
                        })}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {expense.receiptUrl ? (
                        <a
                          href={`/api/file?path=${encodeURIComponent(expense.receiptUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary text-xs hover:text-orange-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          원본
                        </a>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    {isProfessor && (
                      <td className="px-5 py-4 w-[40px]">
                        <DeleteRowButton id={expense.id} action={deleteExpenseAction} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
