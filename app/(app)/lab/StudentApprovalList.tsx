import { Check, X } from 'lucide-react'
import { approveStudentAction, rejectStudentAction } from './actions'
import type { PendingStudent } from '@/lib/supabase'

interface Props {
  students: PendingStudent[]
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function StudentApprovalList({ students }: Props) {
  if (students.length === 0) {
    return (
      <div className="bg-deep-navy-light rounded-xl border border-white/10 p-10 text-center">
        <p className="text-white/40 text-sm">대기 중인 학생이 없습니다.</p>
        <p className="text-white/25 text-xs mt-1">초대 링크로 가입한 학생이 여기 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10">
        <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          {students.length}명 승인 대기 중
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {students.map((student) => (
          <div key={student.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {student.name ?? '(이름 없음)'}
              </p>
              <p className="text-white/40 text-xs truncate">{student.email}</p>
              <p className="text-white/25 text-xs mt-0.5">가입 요청: {formatDate(student.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <form action={approveStudentAction}>
                <input type="hidden" name="userId" value={student.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/25 hover:bg-green-500/25 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  승인
                </button>
              </form>
              <form action={rejectStudentAction}>
                <input type="hidden" name="userId" value={student.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  거절
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
