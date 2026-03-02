'use client'

import { useState, useEffect, useActionState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { updateProjectMetaAction, deleteProjectAction, toggleProjectCompletedAction } from './actions'
import { updateCardLast4Action } from '../projects/[id]/actions'
import type { ProjectRow } from '@/lib/db'

interface Props {
  project: ProjectRow
  workspaceId: string
}

const STATUS_CONFIG = {
  red_zone: { label: 'Red Zone', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  warning: { label: 'Warning', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  on_track: { label: 'On Track', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
}

export default function ProjectManageRow({ project, workspaceId }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editState, editAction, editPending] = useActionState(updateProjectMetaAction, null)

  useEffect(() => {
    if (editState?.ok) setIsEditing(false)
  }, [editState])

  const sc = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.on_track

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors">
      {/* 과제코드 + 이름 */}
      {isEditing ? (
        <td className="px-5 py-3" colSpan={2}>
          <form
            action={editAction}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="projectId" value={project.id} />
            <input
              type="text"
              name="projectCode"
              defaultValue={project.projectCode}
              placeholder="과제코드"
              maxLength={50}
              className="w-28 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-primary/50"
            />
            <input
              type="text"
              name="projectName"
              defaultValue={project.projectName ?? ''}
              placeholder="프로젝트명"
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
            />
            <button type="submit" disabled={editPending} className="p-1.5 text-green-400 hover:text-green-300 transition-colors" aria-label="저장">
              <Check className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 text-white/40 hover:text-white/70 transition-colors" aria-label="취소">
              <X className="w-4 h-4" />
            </button>
            {editState?.error && <span className="text-red-400 text-xs">{editState.error}</span>}
          </form>
        </td>
      ) : (
        <>
          <td className="px-5 py-3">
            <span className="text-white/80 font-mono text-sm">{project.projectCode}</span>
          </td>
          <td className="px-5 py-3">
            <span className="text-white text-sm">{project.projectName || '—'}</span>
          </td>
        </>
      )}

      {/* 법인카드 */}
      {!isEditing && (
        <td className="px-5 py-3">
          <CardLast4Inline projectId={project.id} workspaceId={workspaceId} currentCardLast4={project.cardLast4} />
        </td>
      )}

      {/* 상태 */}
      {!isEditing && (
        <td className="px-5 py-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${sc.className}`}>
            {sc.label}
          </span>
        </td>
      )}

      {/* 작업 */}
      {!isEditing && (
        <td className="px-5 py-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xs">삭제할까요?</span>
              <form action={deleteProjectAction} className="inline">
                <input type="hidden" name="projectId" value={project.id} />
                <button type="submit" className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">확인</button>
              </form>
              <button onClick={() => setConfirmDelete(false)} className="text-white/40 hover:text-white/70 text-xs transition-colors">취소</button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-white/30 hover:text-white/70 transition-colors"
                aria-label="편집"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <form action={toggleProjectCompletedAction} className="inline">
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="isCompleted" value={String(project.isCompleted)} />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs rounded-lg border transition-colors text-white/40 border-white/10 hover:border-white/25 hover:text-white/70"
                >
                  {project.isCompleted ? '재개' : '완료'}
                </button>
              </form>

              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                aria-label="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>
      )}
    </tr>
  )
}

function CardLast4Inline({ projectId, workspaceId, currentCardLast4 }: {
  projectId: string; workspaceId: string; currentCardLast4: string | null
}) {
  const [state, formAction, isPending] = useActionState(updateCardLast4Action, null)
  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input
        type="text"
        name="card_last4"
        defaultValue={currentCardLast4 ?? ''}
        placeholder="1234"
        maxLength={4}
        pattern="\d{4}"
        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-mono placeholder-white/20 focus:outline-none focus:border-primary/50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
      >
        {isPending ? '...' : '저장'}
      </button>
      {state?.ok && <span className="text-green-400 text-xs">✓</span>}
    </form>
  )
}
