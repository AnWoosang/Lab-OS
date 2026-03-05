import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getProjectById, getProjectMembers, getApprovedStudents, getBudgetSummary, getExpensesForProject } from '@/lib/db'
import CardLast4Form from './CardLast4Form'
import MembersForm from './MembersForm'
import BudgetCategoryRow from '../../components/BudgetCategoryRow'

interface Props {
  params: Promise<{ id: string }>
}

function StatCard({ title, value, colorClass }: {
  title: string
  value: string
  colorClass?: string
}) {
  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 px-5 py-4">
      <p className="text-white/40 text-xs mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass ?? 'text-white'}`}>{value}</p>
    </div>
  )
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const { workspaceId, profile } = await getWorkspaceContext()

  const [project, members, students, budgetSummary, expenses] = await Promise.all([
    getProjectById(id, workspaceId),
    getProjectMembers(id, workspaceId),
    getApprovedStudents(workspaceId),
    getBudgetSummary(id, workspaceId),
    getExpensesForProject(id, workspaceId),
  ])

  const expensesByCategory = expenses.reduce<Record<string, typeof expenses>>((acc, e) => {
    const key = e.budgetCategory ?? '미분류'
    acc[key] = [...(acc[key] ?? []), e]
    return acc
  }, {})

  if (!project) notFound()

  const budgetUsed = project.budgetUsed ?? 0
  const budgetPct = project.budgetTotal
    ? Math.min(Math.round((budgetUsed / project.budgetTotal) * 100), 100)
    : null

  const isProfessor = profile.role === 'professor'

  return (
    <div className="p-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        대시보드로
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-white/40 font-mono text-sm">{project.projectCode}</span>
          <h1 className="text-2xl font-bold text-white">
            {project.projectName ?? project.projectCode}
          </h1>
          {project.leadStudent && (
            <span className="text-white/40 text-sm ml-auto">담당: {project.leadStudent}</span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="예산 사용률"
            value={budgetPct != null ? `${budgetPct}%` : '—'}
            colorClass={budgetPct != null && budgetPct > 80 ? 'text-red-400' : 'text-green-400'}
          />
          <StatCard title="종료일" value={project.endDate ?? '—'} />
        </div>
      </div>

      {/* 2-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: budget */}
        <div className="space-y-6">
          {(project.budgetTotal != null || budgetSummary.length > 0) && (
            <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-semibold">예산 현황</h2>
              </div>
              <div className="divide-y divide-white/5">
                {budgetSummary.length === 0 && (
                  <div className="px-5 py-6 text-center text-white/30 text-sm">예산 항목 미설정</div>
                )}
                {budgetSummary.map((item) => (
                  <BudgetCategoryRow
                    key={item.category}
                    item={item}
                    expenses={expensesByCategory[item.category] ?? []}
                  />
                ))}
                {budgetSummary.length > 1 && (() => {
                  const totalAllocated = budgetSummary.reduce((s, b) => s + b.allocatedAmount, 0)
                  const totalUsed = budgetSummary.reduce((s, b) => s + b.usedAmount, 0)
                  const totalRemaining = totalAllocated - totalUsed
                  return (
                    <div className="px-5 py-4 bg-white/5">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-white/40 mb-0.5">총 배정</p>
                          <p className="text-white font-mono font-semibold">{totalAllocated.toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-white/40 mb-0.5">총 사용</p>
                          <p className="text-white font-mono font-semibold">{totalUsed.toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-white/40 mb-0.5">총 잔여</p>
                          <p className={`font-mono font-semibold ${totalRemaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {totalRemaining.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right: professor-only settings */}
        {isProfessor && (
          <div className="space-y-6">
            <MembersForm projectId={id} members={members} students={students} />
            <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-xs mb-1">법인카드 설정</p>
              <p className="text-white/25 text-xs mb-3">
                카드 끝 4자리를 등록하면 학생의 영수증이 자동으로 이 프로젝트에 분류됩니다.
              </p>
              <CardLast4Form
                projectId={id}
                workspaceId={workspaceId}
                currentCardLast4={project.cardLast4}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
