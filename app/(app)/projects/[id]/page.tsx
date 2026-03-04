import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { getProjectById, getProjectMembers, getApprovedStudents, getBudgetSummary } from '@/lib/db'
import CardLast4Form from './CardLast4Form'
import MembersForm from './MembersForm'
import { StatusDot } from '../../components/StatusBadge'

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
  const { profile } = await getCurrentUserWithProfile()
  if (!profile?.workspaceId) redirect('/onboarding')

  const [project, members, students, budgetSummary] = await Promise.all([
    getProjectById(id, profile.workspaceId),
    getProjectMembers(id, profile.workspaceId),
    getApprovedStudents(profile.workspaceId),
    getBudgetSummary(id, profile.workspaceId),
  ])

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
          <StatusDot status={project.status} />
          <span className="text-white/40 font-mono text-sm">{project.projectCode}</span>
          <h1 className="text-2xl font-bold text-white">
            {project.projectName ?? project.projectCode}
          </h1>
          {project.leadStudent && (
            <span className="text-white/40 text-sm ml-auto">담당: {project.leadStudent}</span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="예산 사용률"
            value={budgetPct != null ? `${budgetPct}%` : '—'}
            colorClass={budgetPct != null && budgetPct > 80 ? 'text-red-400' : 'text-green-400'}
          />
          <StatCard
            title="위험도"
            value={project.riskScore != null ? String(project.riskScore) : '—'}
            colorClass={
              project.riskScore != null && project.riskScore >= 70
                ? 'text-red-400'
                : project.riskScore != null && project.riskScore >= 40
                ? 'text-amber-400'
                : undefined
            }
          />
          <StatCard title="종료일" value={project.endDate ?? '—'} />
        </div>
      </div>

      {/* 2-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: bottleneck + budget */}
        <div className="space-y-6">
          {project.bottleneck && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <p className="text-red-400 text-xs font-medium mb-1">현재 병목</p>
              <p className="text-white/80 text-sm">{project.bottleneck}</p>
            </div>
          )}

          {project.budgetTotal != null && (
            <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-semibold">예산 현황</h2>
              </div>
              <div className="divide-y divide-white/5">
                {budgetSummary.length === 0 && (
                  <div className="px-5 py-6 text-center text-white/30 text-sm">예산 항목 미설정</div>
                )}
                {budgetSummary.map((item) => {
                  const pct = item.allocatedAmount > 0
                    ? Math.round((item.usedAmount / item.allocatedAmount) * 100)
                    : 0
                  return (
                    <div key={item.category} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{item.category}</span>
                        <span className={`text-xs font-mono font-semibold ${pct > 80 ? 'text-red-400' : pct > 50 ? 'text-amber-400' : 'text-green-400'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                        <div
                          className={`h-1.5 rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
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
                    </div>
                  )
                })}
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
                workspaceId={profile.workspaceId}
                currentCardLast4={project.cardLast4}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
