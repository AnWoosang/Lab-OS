'use client'

import { useTransition } from 'react'
import { UserCheck, UserX, UserCog } from 'lucide-react'
import type { PendingStudent } from '@/lib/supabase'
import { approveStudentAction, rejectStudentAction } from './approval-actions'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StudentRow({ student }: { student: PendingStudent }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{student.name ?? '이름 없음'}</p>
        <p className="text-white/40 text-xs truncate">{student.email ?? '—'}</p>
      </div>
      <span className="text-white/30 text-xs shrink-0">{formatDate(student.createdAt)}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => approveStudentAction(student.id))}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          승인
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => rejectStudentAction(student.id))}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          <UserX className="w-3.5 h-3.5" />
          거절
        </button>
      </div>
    </div>
  )
}

export default function PendingStudents({ students }: { students: PendingStudent[] }) {
  if (students.length === 0) return null

  return (
    <div className="bg-deep-navy-light rounded-xl border border-amber-500/30 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-500/20">
        <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
          <UserCog className="w-4 h-4 text-amber-400" />
        </div>
        <h2 className="text-white font-semibold">가입 승인 대기</h2>
        <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
          {students.length}명
        </span>
      </div>
      <div>
        {students.map((student) => (
          <StudentRow key={student.id} student={student} />
        ))}
      </div>
    </div>
  )
}
