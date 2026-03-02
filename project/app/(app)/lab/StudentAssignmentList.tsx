import { X, UserPlus } from 'lucide-react'
import { assignStudentAction, unassignStudentAction } from './actions'
import type { UserProfile } from '@/lib/supabase'
import type { ProjectRow, ProjectMemberRow } from '@/lib/db'

interface Props {
  students: UserProfile[]
  projects: ProjectRow[]
  assignments: ProjectMemberRow[]  // project_members with user_id set
}

export default function StudentAssignmentList({ students, projects, assignments }: Props) {
  if (students.length === 0) {
    return (
      <div className="bg-deep-navy-light rounded-xl border border-white/10 p-10 text-center">
        <p className="text-white/40 text-sm">승인된 학생이 없습니다.</p>
        <p className="text-white/25 text-xs mt-1">"학생 승인" 탭에서 먼저 학생을 승인하세요.</p>
      </div>
    )
  }

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">학생</th>
            <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">배정된 프로젝트</th>
            <th className="text-left px-5 py-3 text-white/40 text-xs font-medium">프로젝트 추가</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const studentAssignments = assignments.filter((a) => a.userId === student.id)
            const assignedProjectIds = new Set(studentAssignments.map((a) => a.projectId))
            const availableProjects = projects.filter((p) => !assignedProjectIds.has(p.id))

            return (
              <tr key={student.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                {/* 학생 정보 */}
                <td className="px-5 py-4 align-top">
                  <p className="text-white text-sm font-medium">{student.name ?? '(이름 없음)'}</p>
                  <p className="text-white/40 text-xs mt-0.5">{student.email}</p>
                </td>

                {/* 배정된 프로젝트 태그 */}
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {studentAssignments.length === 0 && (
                      <span className="text-white/25 text-xs">미배정</span>
                    )}
                    {studentAssignments.map((assignment) => {
                      const project = projects.find((p) => p.id === assignment.projectId)
                      return (
                        <form key={assignment.id} action={unassignStudentAction} className="inline-flex">
                          <input type="hidden" name="memberId" value={assignment.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary/80 text-xs px-2 py-0.5 rounded-full hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-colors group"
                            title="배정 해제"
                          >
                            <span className="font-mono">{project?.projectCode ?? '?'}</span>
                            <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                          </button>
                        </form>
                      )
                    })}
                  </div>
                </td>

                {/* 새 프로젝트 배정 */}
                <td className="px-5 py-4 align-top">
                  {availableProjects.length === 0 ? (
                    <span className="text-white/20 text-xs">모든 프로젝트 배정됨</span>
                  ) : (
                    <form action={assignStudentAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={student.id} />
                      <select
                        name="projectId"
                        className="bg-deep-navy border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-primary/50"
                        defaultValue={availableProjects[0].id}
                      >
                        {availableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectCode}{p.projectName ? ` · ${p.projectName}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium border border-primary/25 hover:bg-primary/25 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        배정
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
