import Link from 'next/link'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getWorkspaceById, getPendingStudents } from '@/lib/supabase'
import { getAllProjects, getAllReports, getAllExpenses, type ReportWithProject, type ExpenseWithProject } from '@/lib/db'
import InviteCopyButton from './InviteCopyButton'
import PendingStudents from './PendingStudents'
import RiskAlerts from './RiskAlerts'
import ExpandableText from '../components/ExpandableText'
import { StatusDot, progressToStatus } from '../components/StatusBadge'
import { ProgressBar } from '../components/ProgressBar'
import ReportSummaryModal from '../components/ReportSummaryModal'

// ─── Recent Reports ───────────────────────────────────────────────────────────

function RecentReports({ reports }: { reports: ReportWithProject[] }) {
  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold">최근 보고서</h2>
        <Link href="/reports" className="text-white/40 hover:text-white/70 text-sm transition-colors">
          전체 보기 →
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/30 text-sm">아직 보고서가 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">날짜</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">작성자</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">진도율</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">위험도</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">AI 요약</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">병목</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-white/50 text-xs font-mono">{report.reportDate ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-white/80 font-mono text-sm">{report.projectCode}</span>
                    {report.projectName && (
                      <span className="text-white/40 text-xs ml-2">{report.projectName}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-white/60 text-sm">{report.studentName ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <ProgressBar value={report.progress} />
                  </td>
                  <td className="px-5 py-3">
                    {report.progress != null
                      ? <StatusDot status={progressToStatus(report.progress)} />
                      : <span className="text-white/30 text-sm">—</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <ReportSummaryModal report={report} />
                  </td>
                  <td className="px-5 py-3 max-w-[200px]">
                    {report.bottleneck
                      ? <ExpandableText text={report.bottleneck} maxLines={2} />
                      : <span className="text-white/30 text-sm">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Recent Expenses ──────────────────────────────────────────────────────────

function RecentExpenses({ expenses }: { expenses: ExpenseWithProject[] }) {
  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold">최근 영수증</h2>
        <Link href="/expenses" className="text-white/40 hover:text-white/70 text-sm transition-colors">
          전체 보기 →
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="px-5 py-10 text-center text-white/30 text-sm">아직 영수증이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">날짜</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">거래처</th>
                <th className="text-right px-5 py-3 text-white/40 text-xs font-medium">금액</th>
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">의심</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-white/50 text-xs font-mono">
                      {expense.createdAt ? expense.createdAt.slice(0, 10) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-white/80 font-mono text-sm">{expense.projectCode}</span>
                    {expense.projectName && (
                      <span className="text-white/40 text-xs ml-2">{expense.projectName}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-white/70 text-sm">{expense.vendor || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-white/80 text-sm font-mono">
                      {expense.amount != null ? `₩${expense.amount.toLocaleString()}` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {expense.isSuspicious
                      ? <span className="text-red-400 text-sm">⚠</span>
                      : <span className="text-white/20 text-sm">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { workspaceId } = await getWorkspaceContext()
  const [workspace, pendingStudents, projects, recentReports, recentExpenses] = await Promise.all([
    getWorkspaceById(workspaceId),
    getPendingStudents(workspaceId),
    getAllProjects(workspaceId),
    getAllReports(workspaceId, 5),
    getAllExpenses(workspaceId, 5),
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">대시보드</h1>
          <p className="text-white/50 text-sm mt-1">지금 당장 확인해야 할 것들을 모아뒀어요</p>
        </div>
        {workspace && <InviteCopyButton joinCode={workspace.joinCode} />}
      </div>

      {/* Pending students approval */}
      <PendingStudents students={pendingStudents} />

      {/* Risk alerts */}
      <RiskAlerts projects={projects} />

      {/* Recent reports */}
      <RecentReports reports={recentReports} />

      {/* Recent expenses */}
      <RecentExpenses expenses={recentExpenses} />
    </div>
  )
}
