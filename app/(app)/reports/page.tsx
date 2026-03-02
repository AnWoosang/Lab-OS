import { FileText, ExternalLink } from 'lucide-react'
import { getWorkspaceContext } from '@/lib/workspace-context'
import {
  getAllProjects,
  getAllReports,
  getReportsForProject,
  type ReportRow,
  type ReportWithProject,
} from '@/lib/db'
import { periodToDateRange } from '@/lib/date-filter'
import ProjectFilterTabs from '../components/ProjectFilterTabs'
import PeriodFilterBar from '../components/PeriodFilterBar'
import ExpandableText from '../components/ExpandableText'
import SortableDateHeader from '../components/SortableDateHeader'
import AISummaryCell from '../components/AISummaryCell'
import { generateReportRowSummaryAction } from './actions'

export const dynamic = 'force-dynamic'

function RiskBadge({ progress }: { progress: number | null }) {
  if (progress === null) return null
  const isRed = progress < 65
  const isYellow = progress < 80
  const config = isRed
    ? { label: 'Red Zone', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
    : isYellow
    ? { label: 'Warning', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    : { label: 'On Track', className: 'bg-green-500/20 text-green-400 border-green-500/30' }
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${config.className}`}>
      {config.label}
    </span>
  )
}

function ProgressBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/30 text-sm">—</span>
  const color = value < 65 ? 'bg-red-400' : value < 80 ? 'bg-amber-400' : 'bg-green-400'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-white/10 rounded-full h-1.5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-8 text-right">{value}%</span>
    </div>
  )
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; period?: string; order?: string }>
}) {
  const { workspaceId } = await getWorkspaceContext()
  const { project: projectId, period, order } = await searchParams

  const dateRange = periodToDateRange(period)
  const sortOrder: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc'

  const [projects, rawReports] = await Promise.all([
    getAllProjects(workspaceId),
    projectId
      ? getReportsForProject(projectId, workspaceId)
      : getAllReports(workspaceId, 50, { ...dateRange, order: sortOrder }),
  ])

  const reports: ReportWithProject[] = projectId
    ? (rawReports as ReportRow[]).map((r) => {
        const proj = projects.find((p) => p.id === projectId)
        return { ...r, projectCode: proj?.projectCode ?? '—', projectName: proj?.projectName ?? null }
      })
    : (rawReports as ReportWithProject[])

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null

  // 날짜 정렬 중이 아니면 위험도순 정렬
  const riskOrder = (r: ReportWithProject) =>
    r.progress === null ? 1 : r.progress < 65 ? 0 : r.progress < 80 ? 1 : 2
  const sorted = order ? reports : [...reports].sort((a, b) => riskOrder(a) - riskOrder(b))

  const headingText = selectedProject
    ? `${selectedProject.projectCode} 보고서`
    : '워크스페이스 전체 보고서'

  // 현재 필터 유지 URL (SortableDateHeader용)
  const filterParams = new URLSearchParams()
  if (projectId) filterParams.set('project', projectId)
  if (period && period !== 'all') filterParams.set('period', period)
  const filterQs = filterParams.toString()
  const basePathWithFilters = filterQs ? `/reports?${filterQs}` : '/reports'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">보고서</h1>
        <p className="text-white/50 text-sm mt-1">{headingText} · {reports.length}건</p>
        <ProjectFilterTabs
          projects={projects}
          selectedId={projectId ?? null}
          basePath="/reports"
        />
        <PeriodFilterBar
          currentPeriod={period ?? 'all'}
          basePath="/reports"
          currentProjectId={projectId ?? null}
        />
      </div>

      {reports.length === 0 ? (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 p-16 text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">아직 등록된 보고서가 없습니다.</p>
          <p className="text-white/25 text-xs mt-1">학생이 보고서를 업로드하면 여기에 표시됩니다.</p>
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
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">진도율</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">위험도</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">병목 요약</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">파일</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-white/60 text-xs font-mono whitespace-nowrap">
                        {report.reportDate ?? report.createdAt.slice(0, 10)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{report.projectCode}</p>
                      {report.projectName && (
                        <p className="text-white/40 text-xs mt-0.5">{report.projectName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <ProgressBar value={report.progress} />
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge progress={report.progress} />
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      {report.content
                        ? <ExpandableText text={report.content} maxLines={2} />
                        : <span className="text-white/30 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <AISummaryCell
                        generateAction={generateReportRowSummaryAction.bind(null, {
                          projectCode: report.projectCode,
                          projectName: report.projectName,
                          content: report.content,
                          progress: report.progress,
                          reportDate: report.reportDate,
                        })}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
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
