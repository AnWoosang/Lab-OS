import Link from 'next/link'
import { getWorkspaceContext } from '@/lib/workspace-context'
import { getWorkspaceById, getPendingStudents } from '@/lib/supabase'
import { getAllProjects, getApprovedStudents, getProjectMembersWithUserIds } from '@/lib/db'
import LabTabs from './LabTabs'
import ProjectCreateForm from './ProjectCreateForm'
import StudentApprovalList from './StudentApprovalList'
import StudentAssignmentList from './StudentAssignmentList'
import InviteCard from '../dashboard/InviteCard'
import ProjectManageRow from './ProjectManageRow'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tab?: string; status?: string }>
}

export default async function LabPage({ searchParams }: Props) {
  const { workspaceId } = await getWorkspaceContext()
  const { tab, status } = await searchParams
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

  const statusFilter = status === 'completed' ? 'completed' : 'active'
  const activeProjects = projects.filter((p) => !p.isCompleted)
  const completedProjects = projects.filter((p) => p.isCompleted)
  const filteredProjects = statusFilter === 'completed' ? completedProjects : activeProjects

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

              {/* 상태 필터 Pills */}
              <div className="flex gap-2 mb-4">
                <Link
                  href="/lab?tab=projects&status=active"
                  className={[
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    statusFilter === 'active'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/40 hover:text-white/70 border border-white/10',
                  ].join(' ')}
                >
                  진행중 ({activeProjects.length})
                </Link>
                <Link
                  href="/lab?tab=projects&status=completed"
                  className={[
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    statusFilter === 'completed'
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/40 hover:text-white/70 border border-white/10',
                  ].join(' ')}
                >
                  완료 ({completedProjects.length})
                </Link>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="bg-deep-navy-light rounded-xl border border-white/10 p-10 text-center">
                  <p className="text-white/40 text-sm">
                    {statusFilter === 'completed' ? '완료된 프로젝트가 없습니다.' : '아직 프로젝트가 없습니다.'}
                  </p>
                  {statusFilter === 'active' && (
                    <p className="text-white/25 text-xs mt-1">위 폼에서 과제코드를 입력해 생성하세요.</p>
                  )}
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
                          <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => (
                          <ProjectManageRow
                            key={project.id}
                            project={project}
                            workspaceId={workspaceId}
                          />
                        ))}
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
