import Link from 'next/link'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getWorkspaceById, getPendingStudents } from '@/lib/supabase'
import { getAllProjects, getApprovedStudents, getProjectMembersWithUserIds } from '@/lib/db'
import LabTabs from './LabTabs'
import ProjectCreateForm from './ProjectCreateForm'
import StudentApprovalList from './StudentApprovalList'
import StudentAssignmentList from './StudentAssignmentList'
import InviteCard from '../dashboard/InviteCard'
import CardLast4Form from '../projects/[id]/CardLast4Form'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function LabPage({ searchParams }: Props) {
  const { workspaceId } = await getWorkspaceContext()
  const { tab } = await searchParams
  const currentTab = ['projects', 'approval', 'assignment', 'invite'].includes(tab ?? '')
    ? (tab as string)
    : 'projects'

  const [workspace, projects, pendingStudents, approvedStudents, assignments] = await Promise.all([
    getWorkspaceById(workspaceId),
    getAllProjects(workspaceId),
    getPendingStudents(workspaceId),
    getApprovedStudents(workspaceId),
    getProjectMembersWithUserIds(workspaceId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">내 연구실</h1>
          <p className="text-white/50 text-sm mt-1">{workspace?.labName ?? '—'}</p>
        </div>
        {pendingStudents.length > 0 && (
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            승인 대기 {pendingStudents.length}명
          </span>
        )}
      </div>

      <div className="flex gap-8">
        <LabTabs currentTab={currentTab} />

        <div className="flex-1 min-w-0">
          {/* 프로젝트 관리 */}
          {currentTab === 'projects' && (
            <>
              <h2 className="text-white font-semibold mb-4">프로젝트 관리</h2>
              <ProjectCreateForm />

              {projects.length === 0 ? (
                <div className="bg-deep-navy-light rounded-xl border border-white/10 p-10 text-center">
                  <p className="text-white/40 text-sm">아직 프로젝트가 없습니다.</p>
                  <p className="text-white/25 text-xs mt-1">위 폼에서 과제코드를 입력해 생성하세요.</p>
                </div>
              ) : (
                <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">과제코드</th>
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트명</th>
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">법인카드</th>
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">상태</th>
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">상세</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => {
                          const statusConfig = {
                            red_zone: { label: 'Red Zone', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
                            warning: { label: 'Warning', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                            on_track: { label: 'On Track', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
                          }
                          const sc = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.on_track

                          return (
                            <tr key={project.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                              <td className="px-5 py-3">
                                <span className="text-white/80 font-mono text-sm">{project.projectCode}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-white text-sm">{project.projectName || '—'}</span>
                              </td>
                              <td className="px-5 py-3">
                                <CardLast4Form
                                  projectId={project.id}
                                  workspaceId={workspaceId}
                                  currentCardLast4={project.cardLast4}
                                />
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${sc.className}`}>
                                  {sc.label}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <Link
                                  href={`/projects/${project.id}`}
                                  className="text-primary text-xs hover:text-orange-400 transition-colors"
                                >
                                  상세 →
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 학생 승인 */}
          {currentTab === 'approval' && (
            <>
              <h2 className="text-white font-semibold mb-4">학생 승인</h2>
              <StudentApprovalList students={pendingStudents} />
            </>
          )}

          {/* 학생 배정 */}
          {currentTab === 'assignment' && (
            <>
              <h2 className="text-white font-semibold mb-1">학생 배정</h2>
              <p className="text-white/40 text-sm mb-4">
                학생을 프로젝트에 배정하면 업로드 시 해당 프로젝트가 우선 표시됩니다.
              </p>
              <StudentAssignmentList
                students={approvedStudents}
                projects={projects}
                assignments={assignments}
              />
            </>
          )}

          {/* 초대 링크 */}
          {currentTab === 'invite' && workspace && (
            <>
              <h2 className="text-white font-semibold mb-4">초대 링크</h2>
              <InviteCard workspace={workspace} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
