import { FileText, ExternalLink } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
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
import DateRangePicker from '../components/DateRangePicker'
import ExpandableText from '../components/ExpandableText'
import SortableDateHeader from '../components/SortableDateHeader'
import ReportSummaryModal from '../components/ReportSummaryModal'
import { StatusDot } from '../components/StatusBadge'
import DeleteRowButton from '../components/DeleteRowButton'
import { deleteReportAction } from './actions'

export default async function ReportsPage({
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

  const sorted = reports

  const headingText = selectedProject
    ? `${selectedProject.projectCode} 보고서`
    : '워크스페이스 전체 보고서'

  // 현재 필터 유지 URL (SortableDateHeader용)
  const filterParams = new URLSearchParams()
  if (projectId) filterParams.set('project', projectId)
  if (period && period !== 'all') filterParams.set('period', period)
  const filterQs = filterParams.toString()
  const basePathWithFilters = filterQs ? `/reports?${filterQs}` : '/reports'

  const isProfessor = profile.role === 'professor'

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
        <DateRangePicker basePath="/reports" currentProjectId={projectId ?? null} />
      </div>

      {reports.length === 0 ? (
        <EmptyState icon={FileText} message="아직 등록된 보고서가 없습니다." sub="학생이 보고서를 업로드하면 여기에 표시됩니다." />
      ) : (
        <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 w-[120px]">
                    <SortableDateHeader currentOrder={sortOrder} basePath={basePathWithFilters} />
                  </th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[160px]">프로젝트</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[100px]">작성자</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[80px]">상태</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[160px]">병목</th>
                  <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[60px]">파일</th>
                  {isProfessor && (
                    <th className="text-left px-5 py-3 text-white/40 text-xs font-medium w-[40px]"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-4 w-[120px]">
                      <span className="text-white/60 text-xs font-mono whitespace-nowrap">
                        {report.reportDate ?? report.createdAt.slice(0, 10)}
                      </span>
                    </td>
                    <td className="px-5 py-4 w-[160px]">
                      <p className="text-white font-medium text-sm font-mono whitespace-nowrap">{report.projectCode}</p>
                      {report.projectName && (
                        <p className="text-white/40 text-xs mt-0.5 truncate max-w-[140px]">{report.projectName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 w-[100px]">
                      <span className="text-white/60 text-xs">{report.studentName ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 w-[80px]">
                      {report.bottleneck !== null
                        ? <StatusDot status="warning" />
                        : <span className="text-white/20 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4 max-w-[260px]">
                      {(report.content || report.aiAnalysis)
                        ? (
                          <div className="space-y-1.5">
                            {report.content && (
                              <ExpandableText text={report.content} maxLines={2} />
                            )}
                            <ReportSummaryModal
                              report={{
                                projectCode: report.projectCode,
                                projectName: report.projectName,
                                reportDate: report.reportDate,
                                createdAt: report.createdAt,
                                bottleneck: report.bottleneck,
                                nextPlan: report.nextPlan,
                                aiAnalysis: report.aiAnalysis,
                              }}
                            />
                          </div>
                        )
                        : <span className="text-white/30 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4 w-[160px]">
                      {report.bottleneck
                        ? <ExpandableText text={report.bottleneck} maxLines={2} />
                        : <span className="text-white/30 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-4 w-[60px]">
                      {report.fileUrl ? (
                        <a
                          href={`/api/file?path=${encodeURIComponent(report.fileUrl)}`}
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
                        <DeleteRowButton id={report.id} action={deleteReportAction} />
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
