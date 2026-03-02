'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { uploadFileAction, type UploadResult } from '../actions'
import MessageBubble, { type MessageItem } from './MessageBubble'
import SessionSidebar from './SessionSidebar'
import FileUploadInput from './FileUploadInput'
import type { ProjectRow } from '@/lib/db'
import type { UploadSessionRow } from '@/lib/db'

interface Props {
  workspaceId: string
  projects: ProjectRow[]
  myProjects: ProjectRow[]
  initialSessions: UploadSessionRow[]
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export default function UploadClient({ projects, myProjects, initialSessions }: Props) {
  const displayProjects = myProjects.length > 0 ? myProjects : projects
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [sessions, setSessions] = useState<UploadSessionRow[]>(initialSessions)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    myProjects.length === 1 ? myProjects[0].id : ''
  )
  const [uploadKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [fullAreaDrag, setFullAreaDrag] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const dragCounterRef = useRef(0)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUpload = (file: File) => {
    const tempId = Date.now().toString()

    // Optimistic: add file bubble + processing bubble
    setMessages((prev) => [
      ...prev,
      {
        id: `file-${tempId}`,
        type: 'file_upload',
        fileName: file.name,
        fileSize: file.size,
        createdAt: new Date(),
      },
      {
        id: `result-${tempId}`,
        type: 'result',
        status: 'processing',
        createdAt: new Date(),
      },
    ])

    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      if (selectedProjectId) formData.append('projectId', selectedProjectId)

      let result: UploadResult
      try {
        result = await uploadFileAction(null, formData)
      } catch {
        result = { ok: false, error: '업로드 중 오류가 발생했습니다.' }
      }

      // Update result bubble
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `result-${tempId}`
            ? {
                ...m,
                status: result.ok ? 'done' : 'error',
                resultType: result.type,
                message: result.message,
                errorMsg: result.error,
              }
            : m
        )
      )

      // Update sessions list with new session (optimistic — will refresh on next load)
      if (result.sessionId) {
        const optimisticSession: UploadSessionRow = {
          id: result.sessionId,
          userId: '',
          workspaceId: '',
          projectId: selectedProjectId || null,
          fileName: file.name,
          fileUrl: null,
          resultType: result.ok ? (result.type ?? null) : null,
          resultData: null,
          status: result.ok ? 'done' : 'error',
          errorMsg: result.error ?? null,
          createdAt: new Date().toISOString(),
        }
        setSessions((prev) => [optimisticSession, ...prev])
      }
    })
  }

  // 전체 영역 드래그앤드롭 핸들러 (자식 요소 이동 시 flicker 방지용 카운터)
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current += 1
    if (e.dataTransfer.types.includes('Files')) setFullAreaDrag(true)
  }
  const onDragLeave = () => {
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setFullAreaDrag(false)
  }
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setFullAreaDrag(false)
    const file = e.dataTransfer.files[0]
    if (file && ALLOWED_TYPES.includes(file.type)) handleUpload(file)
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Sessions sidebar */}
      <SessionSidebar sessions={sessions} />

      {/* Main chat area */}
      <div
        className="flex-1 flex flex-col min-w-0 relative"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* 전체 영역 드래그 오버레이 */}
        {fullAreaDrag && (
          <div className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary/60 rounded-none flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl mb-3">📎</span>
            <p className="text-primary text-lg font-semibold">파일을 여기에 놓으세요</p>
            <p className="text-primary/60 text-sm mt-1">JPG · PNG · PDF · 최대 20MB</p>
          </div>
        )}
        {/* Project selector */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-deep-navy-light flex-shrink-0">
          <span className="text-white/60 text-sm font-medium">프로젝트:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-deep-navy border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="">선택 (자동 감지)</option>
            {displayProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode}{p.projectName ? ` · ${p.projectName}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">📎</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">파일 업로드</h3>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                주간 보고서(PDF/이미지) 또는 영수증을 업로드하면 AI가 자동으로 분석하여 등록합니다.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
                <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10 text-left">
                  <p className="text-white text-sm font-medium mb-1">📄 주간 보고서</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    진도율, 이번 주 활동, 다음 주 계획
                  </p>
                </div>
                <div className="bg-deep-navy-light rounded-xl p-4 border border-white/10 text-left">
                  <p className="text-white text-sm font-medium mb-1">🧾 영수증</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    업체명, 날짜, 금액이 선명한 이미지
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* File upload input */}
        <FileUploadInput
          key={uploadKey}
          onUpload={handleUpload}
          isPending={isPending}
        />
      </div>
    </div>
  )
}
