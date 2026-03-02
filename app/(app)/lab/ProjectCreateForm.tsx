'use client'

import { useActionState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { createProjectAction } from './actions'

export default function ProjectCreateForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-white/40 text-xs">과제코드 *</label>
        <input
          type="text"
          name="project_code"
          placeholder="AI-2024-01"
          required
          maxLength={50}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-primary/50 w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-white/40 text-xs">프로젝트명 (선택)</label>
        <input
          type="text"
          name="project_name"
          placeholder="자연어 처리 연구"
          maxLength={100}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 w-52"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        {isPending ? '생성 중...' : '생성'}
      </button>

      {state?.ok && (
        <span className="text-green-400 text-sm">✓ {state.projectCode} 생성됨</span>
      )}
      {state?.error && (
        <span className="text-red-400 text-sm">{state.error}</span>
      )}
    </form>
  )
}
