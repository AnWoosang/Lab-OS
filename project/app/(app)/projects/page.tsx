import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { getAllProjects, type ProjectRow } from '@/lib/db'
import AISummaryCard from '../components/AISummaryCard'
import AISummaryCell from '../components/AISummaryCell'
import ExpandableText from '../components/ExpandableText'
import { generateProjectSummaryAction, generateProjectRowSummaryAction } from './actions'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
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
      <div className="flex-1 bg-white/10 rounded-full h-1.5 w-24">
        <div
          className={`h-full rounded-full ${
            pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-green-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/60 text-xs font-mono">
        {pct}% · {used.toLocaleString()}원
      </span>
    </div>
  )
}

export default async function ProjectsPage() {
  const { profile } = await getCurrentUserWithProfile()
  if (!profile?.workspaceId) redirect('/onboarding')

  const projects = await getAllProjects(profile.workspaceId)
  const order = { red_zone: 0, warning: 1, on_track: 2 }
  const sorted = [...projects].sort(
    (a, b) =>
      (order[a.status as keyof typeof order] ?? 2) -
      (order[b.status as keyof typeof order] ?? 2)
  )

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

      <AISummaryCard summaryAction={generateProjectSummaryAction} />

      {projects.length === 0 ? (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 p-16 text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">아직 등록된 프로젝트가 없습니다.</p>
          <p className="text-white/25 text-xs mt-1">
            학생이 보고서를 업로드하면 자동으로 생성됩니다.
          </p>
        </div>
      ) : (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">과제코드</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트명</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">담당자</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">상태</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">병목</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">예산 현황</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">기간</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((project: ProjectRow) => (
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
                      <span className="text-white/60 text-sm">{project.leadStudent || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      {project.bottleneck
                        ? <ExpandableText text={project.bottleneck} maxLines={1} />
                        : <span className="text-white/30 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <AISummaryCell
                        generateAction={generateProjectRowSummaryAction.bind(null, {
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
