'use client'

import { useActionState, useState } from 'react'
import { X, UserPlus, User } from 'lucide-react'
import { addMemberAction, removeMemberAction } from './member-actions'
import type { ProjectMemberRow } from '@/lib/db'
import type { UserProfile } from '@/lib/supabase'

interface Props {
  projectId: string
  members: ProjectMemberRow[]
  students: UserProfile[]
}

type AddTab = 'account' | 'name'

export default function MembersForm({ projectId, members, students }: Props) {
  const [addState, addAction, isAdding] = useActionState(addMemberAction, null)
  const [, removeAction] = useActionState(removeMemberAction, null)
  const [tab, setTab] = useState<AddTab>('account')

  // 이미 배정된 학생 user_id set
  const assignedUserIds = new Set(members.map((m) => m.userId).filter(Boolean))
  const availableStudents = students.filter((s) => !assignedUserIds.has(s.id))

  return (
    <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10 mb-6">
      <p className="text-white/60 text-sm font-medium mb-3">담당자</p>

      {/* Member tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {members.length === 0 && (
          <span className="text-white/25 text-xs">등록된 담당자가 없습니다.</span>
        )}
        {members.map((member) => (
          <form key={member.id} action={removeAction} className="inline-flex">
            <input type="hidden" name="memberId" value={member.id} />
            <input type="hidden" name="projectId" value={projectId} />
            <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary/80 text-xs px-2.5 py-1 rounded-full">
              {member.userId && <User className="w-3 h-3 text-primary/60" />}
              {member.name}
              <button
                type="submit"
                className="text-primary/40 hover:text-primary/80 transition-colors"
                aria-label={`${member.name} 제거`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </form>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => setTab('account')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            tab === 'account'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          계정 연결
        </button>
        <button
          type="button"
          onClick={() => setTab('name')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            tab === 'name'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          이름 추가
        </button>
      </div>

      {/* Add member form */}
      {tab === 'account' ? (
        <form action={addAction} className="flex items-center gap-2">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="tab" value="account" />
          {availableStudents.length === 0 ? (
            <p className="text-white/30 text-xs flex-1">
              {students.length === 0
                ? '워크스페이스에 승인된 학생이 없습니다.'
                : '모든 학생이 이미 배정되었습니다.'}
            </p>
          ) : (
            <>
              <select
                name="userId"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
                defaultValue=""
              >
                <option value="" disabled>학생 선택</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.email ?? s.id}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isAdding ? '추가 중...' : '배정'}
              </button>
            </>
          )}
        </form>
      ) : (
        <form action={addAction} className="flex items-center gap-2">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="tab" value="name" />
          <input
            type="text"
            name="name"
            placeholder="이름 입력"
            maxLength={50}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isAdding ? '추가 중...' : '추가'}
          </button>
        </form>
      )}
      {addState?.error && (
        <p className="text-red-400 text-xs mt-1.5">{addState.error}</p>
      )}
    </div>
  )
}
