import Link from 'next/link'
import { FolderOpen, BarChart2, CheckCircle2 } from 'lucide-react'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getAllProjects, getAllProjectLeads, type ProjectRow } from '@/lib/db'
import { EmptyState } from '../components/EmptyState'
import { BudgetBar } from '../components/BudgetBar'
import BudgetDetailModal from '../components/BudgetDetailModal'

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({ projects }: { projects: ProjectRow[] }) {
  const total = projects.length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetTotal ?? 0), 0)
  const usedBudget = projects.reduce((sum, p) => sum + (p.budgetUsed ?? 0), 0)
  const budgetPct = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

  const stats = [
    { label: '전체 프로젝트', value: total, Icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    {
      label: '예산 사용률',
      value: `${budgetPct}%`,
      Icon: CheckCircle2,
      color: budgetPct > 80 ? 'text-red-400' : 'text-green-400',
      bg: budgetPct > 80 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
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

export default async function ProjectsPage() {
  const { workspaceId } = await getWorkspaceContext()

  const [projects, leadsMap] = await Promise.all([
    getAllProjects(workspaceId),
    getAllProjectLeads(workspaceId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">프로젝트</h1>
          <p className="text-white/50 text-sm mt-1">
            연구실의 모든 과제 목록 · 총 {projects.length}개
          </p>
        </div>
      </div>

      <StatsCards projects={projects} />

      {projects.length === 0 ? (
        <EmptyState icon={FolderOpen} message="아직 등록된 프로젝트가 없습니다." sub="학생이 보고서를 업로드하면 자동으로 생성됩니다." />
      ) : (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">과제코드</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트명</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">담당자</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">예산 현황</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">기간</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project: ProjectRow) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-white/80 font-mono text-sm">{project.projectCode}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-white font-medium hover:text-primary transition-colors"
                      >
                        {project.projectName || '—'}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/60 text-sm">
                        {(leadsMap[project.id] ?? []).map(l => l.name).join(', ') || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <BudgetBar used={project.budgetUsed} total={project.budgetTotal} />
                      <BudgetDetailModal projectId={project.id} projectName={project.projectName} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white/40 text-xs font-mono">
                        {project.startDate ?? '—'} ~ {project.endDate ?? '—'}
                      </span>
                    </td>
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
