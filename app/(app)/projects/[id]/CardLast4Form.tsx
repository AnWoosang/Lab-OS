'use client'

import { useActionState } from 'react'
import { updateCardLast4Action } from './actions'

interface Props {
  projectId: string
  workspaceId: string
  currentCardLast4: string | null
}

export default function CardLast4Form({ projectId, workspaceId, currentCardLast4 }: Props) {
  const [state, formAction, isPending] = useActionState(updateCardLast4Action, null)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input
        type="text"
        name="card_last4"
        defaultValue={currentCardLast4 ?? ''}
        placeholder="1234"
        maxLength={4}
        pattern="\d{4}"
        className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
      {state?.ok && (
        <span className="text-green-400 text-xs">✓ 저장됨</span>
      )}
      {state?.error && (
        <span className="text-red-400 text-xs">{state.error}</span>
      )}
    </form>
  )
}
