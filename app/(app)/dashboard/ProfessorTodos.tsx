'use client'

import { useState, useTransition } from 'react'
import { ClipboardList } from 'lucide-react'
import type { ReportWithProject } from '@/lib/db'
import { toggleProfessorResolvedAction } from './actions'

export default function ProfessorTodos({ todos }: { todos: ReportWithProject[] }) {
  const [optimisticTodos, setOptimisticTodos] = useState(todos)
  const [showAll, setShowAll] = useState(false)
  const [, startTransition] = useTransition()

  const unresolved = optimisticTodos.filter((t) => !t.professorResolved)
  const displayed = showAll ? optimisticTodos : unresolved

  function handleToggle(id: string, current: boolean) {
    const next = !current
    setOptimisticTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, professorResolved: next } : t))
    )
    startTransition(() => toggleProfessorResolvedAction(id, next))
  }

  if (optimisticTodos.length === 0) return null

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-white font-semibold">교수 권고사항</h2>
        {unresolved.length > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {unresolved.length}건
          </span>
        )}
        <button
          onClick={() => setShowAll((v) => !v)}
          className="ml-auto text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          {showAll ? '미완료만' : '전체 보기'}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="px-5 py-8 text-center text-white/40 text-sm">
          미해결 권고사항이 없습니다 ✓
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {displayed.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-start gap-4 px-5 py-4 transition-opacity ${
                todo.professorResolved ? 'opacity-40' : ''
              }`}
            >
              <button
                onClick={() => handleToggle(todo.id, todo.professorResolved)}
                className={`mt-0.5 w-4 h-4 shrink-0 rounded border transition-colors ${
                  todo.professorResolved
                    ? 'bg-white/20 border-white/20'
                    : 'border-white/40 hover:border-white/70'
                }`}
                aria-label={todo.professorResolved ? '완료 취소' : '완료 처리'}
              >
                {todo.professorResolved && (
                  <svg viewBox="0 0 12 12" className="w-full h-full text-white/60 p-0.5" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-white/90">{todo.projectCode}</span>
                  {todo.projectName && (
                    <span className="text-white/50 text-xs truncate">{todo.projectName}</span>
                  )}
                </div>
                <p
                  className={`text-sm text-white/70 mt-1 line-clamp-2 ${
                    todo.professorResolved ? 'line-through' : ''
                  }`}
                >
                  {todo.bottleneck}
                </p>
              </div>

              <span className="shrink-0 text-white/30 text-xs font-mono mt-0.5">
                {todo.reportDate ?? todo.createdAt.slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
