'use client'

import { FileText, Receipt, AlertTriangle, Loader2 } from 'lucide-react'
import type { UploadSessionRow } from '@/lib/db'

interface Props {
  sessions: UploadSessionRow[]
}

function SessionIcon({ session }: { session: UploadSessionRow }) {
  if (session.status === 'processing') return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
  if (session.status === 'error') return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
  if (session.resultType === 'report') return <FileText className="w-3.5 h-3.5 text-blue-400" />
  if (session.resultType === 'expense') return <Receipt className="w-3.5 h-3.5 text-green-400" />
  return <FileText className="w-3.5 h-3.5 text-white/30" />
}

function resultLabel(session: UploadSessionRow): string {
  if (session.status === 'error') return '오류'
  if (session.resultType === 'report') return '보고서'
  if (session.resultType === 'expense') return '영수증'
  return '처리 중'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// Group sessions by date
function groupByDate(sessions: UploadSessionRow[]) {
  const groups: Record<string, UploadSessionRow[]> = {}
  for (const s of sessions) {
    const key = new Date(s.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return groups
}

export default function SessionSidebar({ sessions }: Props) {
  const groups = groupByDate(sessions)

  return (
    <div className="w-64 flex-shrink-0 bg-deep-navy-light border-r border-white/10 flex flex-col overflow-hidden">
      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-white/30 text-xs">업로드 기록이 없습니다</p>
          </div>
        ) : (
          Object.entries(groups).map(([date, groupSessions]) => (
            <div key={date}>
              <div className="px-4 py-2">
                <p className="text-white/30 text-xs font-medium">{date}</p>
              </div>
              {groupSessions.map((session) => (
                <div
                  key={session.id}
                  className="mx-2 mb-1 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <SessionIcon session={session} />
                    <span className="text-white/40 text-xs">{formatDate(session.createdAt)}</span>
                    <span
                      className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${
                        session.status === 'error'
                          ? 'bg-red-500/10 text-red-400'
                          : session.resultType === 'report'
                          ? 'bg-blue-500/10 text-blue-400'
                          : session.resultType === 'expense'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {resultLabel(session)}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs truncate pl-5">{session.fileName}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
