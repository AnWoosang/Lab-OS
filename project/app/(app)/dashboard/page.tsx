import { Suspense } from 'react'
import { BarChart2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getWorkspaceById, getPendingStudents } from '@/lib/supabase'
import { getAllProjects, type ProjectRow } from '@/lib/db'
import InviteCard from './InviteCard'
import PendingStudents from './PendingStudents'
import ExpandableText from '../components/ExpandableText'
import AISummaryCell from '../components/AISummaryCell'
import { generateDashboardProjectRowSummaryAction } from './actions'

export const dynamic = 'force-dynamic'

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-deep-navy-light rounded-xl p-5 border border-white/10 animate-pulse"
        >
          <div className="h-4 bg-white/10 rounded w-24 mb-3"></div>
          <div className="h-8 bg-white/10 rounded w-16"></div>
        </div>
      ))}
    </div>
  )
}

function ProjectTableSkeleton() {
  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <div className="h-6 bg-white/10 rounded w-32 animate-pulse"></div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-white/5 animate-pulse"
        >
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="h-4 bg-white/10 rounded w-32"></div>
          <div className="h-6 bg-white/10 rounded w-16"></div>
          <div className="h-4 bg-white/10 rounded w-20 ml-auto"></div>
        </div>
      ))}
    </div>
  )
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

async function StatsCards({ workspaceId }: { workspaceId: string }) {
  const projects = await getAllProjects(workspaceId)

  const total = projects.length
  const redZone = projects.filter((p) => p.status === 'red_zone').length
  const warning = projects.filter((p) => p.status === 'warning').length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetTotal ?? 0), 0)
  const usedBudget = projects.reduce((sum, p) => sum + (p.budgetUsed ?? 0), 0)
  const budgetPct = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

  const stats = [
    { label: '전체 프로젝트', value: total, Icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: '🔴 Red Zone', value: redZone, Icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: '🟡 Warning', value: warning, Icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    {
      label: '예산 사용률',
      value: `${budgetPct}%`,
      Icon: CheckCircle2,
      color: budgetPct > 80 ? 'text-red-400' : 'text-green-400',
      bg: budgetPct > 80 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-deep-navy-light rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-white/60 text-sm">{stat.label}</span>
          </div>
          <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Project Table ────────────────────────────────────────────────────────────

function RiskBadge({ status }: { status: string }) {
  const config = {
    red_zone: { label: 'Red Zone', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    warning: { label: 'Warning', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    on_track: { label: 'On Track', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  }
  const c = config[status as keyof typeof config] ?? config.on_track
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${c.className}`}>
      {c.label}
    </span>
  )
}

function BudgetBar({ used, total }: { used: number | null; total: number | null }) {
  if (!total || !used) return <span className="text-white/30 text-sm">—</span>
  const pct = Math.min(Math.round((used / total) * 100), 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/10 rounded-full h-1.5 w-20">
        <div
          className={`h-full rounded-full ${
            pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-green-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/60 text-xs font-mono">{pct}%</span>
    </div>
  )
}

async function ProjectTable({ workspaceId }: { workspaceId: string }) {
  const projects = await getAllProjects(workspaceId)
  const order = { red_zone: 0, warning: 1, on_track: 2 }
  const sorted = [...projects].sort(
    (a, b) =>
      (order[a.status as keyof typeof order] ?? 2) -
      (order[b.status as keyof typeof order] ?? 2)
  )

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold">프로젝트 현황</h2>
        <span className="text-white/40 text-sm">{projects.length}개</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">과제코드</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트명</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">상태</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">병목</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">예산</th>
              <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">담당자</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
                  아직 프로젝트가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((project: ProjectRow) => (
                <tr
                  key={project.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-white/80 font-mono text-sm">{project.projectCode}</span>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`/projects/${project.id}`}
                      className="text-white font-medium hover:text-primary transition-colors"
                    >
                      {project.projectName || '—'}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge status={project.status} />
                  </td>
                  <td className="px-5 py-4 max-w-[200px]">
                    {project.bottleneck
                      ? <ExpandableText text={project.bottleneck} maxLines={1} />
                      : <span className="text-white/30 text-sm">—</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <AISummaryCell
                      generateAction={generateDashboardProjectRowSummaryAction.bind(null, {
                        projectCode: project.projectCode,
                        projectName: project.projectName,
                        status: project.status,
                        bottleneck: project.bottleneck,
                        riskScore: project.riskScore,
                        budgetTotal: project.budgetTotal,
                        budgetUsed: project.budgetUsed,
                      })}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <BudgetBar used={project.budgetUsed} total={project.budgetTotal} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white/60 text-sm">{project.leadStudent || '—'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { workspaceId } = await getWorkspaceContext()
  const [workspace, pendingStudents] = await Promise.all([
    getWorkspaceById(workspaceId),
    getPendingStudents(workspaceId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-white/50 text-sm mt-1">연구실 프로젝트 현황을 한 눈에 확인하세요</p>
      </div>

      {/* Pending students approval */}
      <PendingStudents students={pendingStudents} />

      {/* Invite Link Card */}
      {workspace && <InviteCard workspace={workspace} />}

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards workspaceId={workspaceId} />
      </Suspense>

      <Suspense fallback={<ProjectTableSkeleton />}>
        <ProjectTable workspaceId={workspaceId} />
      </Suspense>
    </div>
  )
}
