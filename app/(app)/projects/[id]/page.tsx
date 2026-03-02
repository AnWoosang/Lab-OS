import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2, FileText, ExternalLink } from 'lucide-react'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { getProjectById, getReportsForProject, getProjectMembers, getApprovedStudents } from '@/lib/db'
import CardLast4Form from './CardLast4Form'
import MembersForm from './MembersForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const { profile } = await getCurrentUserWithProfile()
  if (!profile?.workspaceId) redirect('/onboarding')

  const [project, reports, members, students] = await Promise.all([
    getProjectById(id, profile.workspaceId),
    getReportsForProject(id, profile.workspaceId),
    getProjectMembers(id, profile.workspaceId),
    getApprovedStudents(profile.workspaceId),
  ])

  if (!project) notFound()

  const statusConfig = {
    red_zone: { label: 'Red Zone', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    on_track: { label: 'On Track', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  }
  const sc = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.on_track

  const budgetPct =
    project.budgetTotal && project.budgetUsed
      ? Math.round((project.budgetUsed / project.budgetTotal) * 100)
      : null

  return (
    <div className="p-6 max-w-4xl">
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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/40 text-sm font-mono mb-1">{project.projectCode}</p>
            <h1 className="text-2xl font-bold text-white">{project.projectName || '—'}</h1>
            {project.leadStudent && (
              <p className="text-white/50 text-sm mt-1">담당: {project.leadStudent}</p>
            )}
          </div>
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${sc.bg} ${sc.color}`}>
            {sc.label}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {project.bottleneck && (
          <div className="col-span-2 lg:col-span-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-xs font-semibold mb-1">현재 병목</p>
            <p className="text-white/80 text-sm">{project.bottleneck}</p>
          </div>
        )}

        {budgetPct !== null && (
          <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-white/40" />
              <span className="text-white/40 text-xs">예산 사용률</span>
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
                budgetPct > 80 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {budgetPct}%
            </div>
            <p className="text-white/40 text-xs mt-1">
              {project.budgetUsed?.toLocaleString()}원 / {project.budgetTotal?.toLocaleString()}원
            </p>
          </div>
        )}
      </div>

      {/* 담당자 관리 */}
      {profile.role === 'professor' && (
        <MembersForm projectId={id} members={members} students={students} />
      )}

      {/* 법인카드 설정 */}
      {profile.role === 'professor' && (
        <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10 mb-6">
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
      )}

      {/* Reports */}
      <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <FileText className="w-4 h-4 text-white/40" />
          <h2 className="text-white font-semibold">보고서 히스토리</h2>
          <span className="text-white/30 text-sm ml-auto">{reports.length}건</span>
        </div>

        {reports.length === 0 ? (
          <div className="px-5 py-10 text-center text-white/30 text-sm">
            아직 제출된 보고서가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white/40 text-xs font-mono">
                        {report.reportDate ?? '날짜 미상'}
                      </span>
                      {report.progress !== null && (
                        <span className="text-primary text-xs font-semibold">
                          진도율 {report.progress}%
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {report.content || '내용 없음'}
                    </p>
                  </div>
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1 text-primary text-xs hover:text-orange-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      원본
                    </a>
                  )}
                </div>
                {report.progress !== null && (
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          report.progress < 65
                            ? 'bg-red-400'
                            : report.progress < 80
                            ? 'bg-amber-400'
                            : 'bg-green-400'
                        }`}
                        style={{ width: `${report.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
