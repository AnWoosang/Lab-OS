'use client'

import { useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { getUploadUrlAction, processUploadAction, type UploadResult } from '../actions'
import { getProjectBudgetsAction } from '@/app/(app)/lab/actions'
import MessageBubble, { type MessageItem } from './MessageBubble'
import SessionSidebar from './SessionSidebar'
import FileUploadInput from './FileUploadInput'
import type { ProjectRow, UploadSessionRow, ProjectBudgetRow } from '@/lib/db'

interface Props {
  workspaceId: string
  projects: ProjectRow[]
  myProjects: ProjectRow[]
  initialSessions: UploadSessionRow[]
}

const ACCEPTED_MIME_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'image/gif': [],
  'image/webp': [],
  'application/pdf': [],
}

export default function UploadClient({ projects, myProjects, initialSessions }: Props) {
  const displayProjects = myProjects.length > 0 ? myProjects : projects
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [sessions, setSessions] = useState<UploadSessionRow[]>(initialSessions)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    myProjects.length === 1 ? myProjects[0].id : ''
  )
  const [budgetCategories, setBudgetCategories] = useState<ProjectBudgetRow[]>([])
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>('')
  const [activeCount, setActiveCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isPending = activeCount > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedBudgetCategory('')
    if (projectId) {
      const budgets = await getProjectBudgetsAction(projectId)
      setBudgetCategories(budgets)
    } else {
      setBudgetCategories([])
    }
  }

  const updateMsg = (id: string, patch: Partial<MessageItem>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  const handleUploads = async (files: File[]) => {
    if (!selectedProjectId) {
      setMessages((prev) => [
        ...prev,
        {
          id: `warn-${Date.now()}`,
          type: 'result',
          status: 'error',
          errorMsg: '업로드하기 전에 프로젝트를 선택해주세요.',
          createdAt: new Date(),
        },
      ])
      return
    }

    // 각 파일에 optimistic 버블 추가
    const tempIds = files.map((_, i) => `${Date.now()}-${i}`)
    const newMessages: MessageItem[] = []
    files.forEach((file, i) => {
      newMessages.push({ id: `file-${tempIds[i]}`, type: 'file_upload', fileName: file.name, fileSize: file.size, createdAt: new Date() })
      newMessages.push({ id: `result-${tempIds[i]}`, type: 'result', status: 'uploading', createdAt: new Date() })
    })
    setMessages((prev) => [...prev, ...newMessages])
    setActiveCount((c) => c + files.length)

    await Promise.allSettled(
      files.map(async (file, i) => {
        const resultId = `result-${tempIds[i]}`
        try {
          // ── Step 1: Presigned URL 발급 ─────────────────────────────────────
          const urlResult = await getUploadUrlAction(file.name, file.type)
          if (!urlResult.ok || !urlResult.signedUrl || !urlResult.storagePath) {
            updateMsg(resultId, { status: 'error', errorMsg: urlResult.error ?? '업로드 준비 실패' })
            return
          }

          // ── Step 2: Supabase에 직접 PUT 업로드 (Vercel 통과 없음) ──────────
          const uploadRes = await fetch(urlResult.signedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          })
          if (!uploadRes.ok) {
            updateMsg(resultId, { status: 'error', errorMsg: '파일 업로드 실패. 다시 시도해주세요.' })
            return
          }

          // ── Step 3: 서버에서 Gemini OCR + DB 저장 ─────────────────────────
          updateMsg(resultId, { status: 'processing' })
          let result: UploadResult
          try {
            result = await processUploadAction(urlResult.storagePath, file.name, file.type, selectedProjectId, selectedBudgetCategory || null)
          } catch {
            result = { ok: false, error: '처리 중 오류가 발생했습니다.' }
          }

          updateMsg(resultId, {
            status: result.ok ? 'done' : 'error',
            resultType: result.type,
            message: result.message,
            errorMsg: result.error,
            budgetCategory: result.budgetCategory,
            budgetCategoryAutoAssigned: result.budgetCategoryAutoAssigned,
          })

          if (result.sessionId) {
            setSessions((prev) => [
              {
                id: result.sessionId!,
                userId: '', workspaceId: '',
                projectId: selectedProjectId,
                fileName: file.name, fileUrl: null,
                resultType: result.ok ? (result.type ?? null) : null,
                resultData: null,
                status: result.ok ? 'done' : 'error',
                errorMsg: result.error ?? null,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ])
          }
        } catch (err) {
          updateMsg(resultId, { status: 'error', errorMsg: '예기치 못한 오류가 발생했습니다.' })
          console.error('[UploadClient] 파일 처리 오류:', err)
        } finally {
          setActiveCount((c) => c - 1)
        }
      })
    )
  }

  // 전체 영역 드래그앤드롭 (react-dropzone)
  const { getRootProps, isDragActive } = useDropzone({
    accept: ACCEPTED_MIME_TYPES,
    maxFiles: 5,
    maxSize: 15 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) handleUploads(acceptedFiles)
    },
  })

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      <SessionSidebar sessions={sessions} />

      <div
        {...getRootProps()}
        className="flex-1 flex flex-col min-w-0 relative focus:outline-none"
      >
        {isDragActive && (
          <div className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary/60 rounded-none flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl mb-3">📎</span>
            <p className="text-primary text-lg font-semibold">파일을 여기에 놓으세요</p>
            <p className="text-primary/60 text-sm mt-1">JPG · PNG · PDF · 최대 15MB · 최대 5개</p>
          </div>
        )}

        {/* 프로젝트 선택 */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10 bg-deep-navy-light flex-shrink-0">
          <span className="text-white/60 text-sm font-medium">프로젝트:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className={[
              'bg-deep-navy border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 transition-colors',
              !selectedProjectId ? 'border-amber-500/50 text-amber-400/70' : 'border-white/10 text-white',
            ].join(' ')}
          >
            <option value="" disabled>프로젝트를 선택하세요</option>
            {displayProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode}{p.projectName ? ` · ${p.projectName}` : ''}
              </option>
            ))}
          </select>
          {budgetCategories.length > 0 && (
            <>
              <span className="text-white/30 text-sm">예산:</span>
              <select
                value={selectedBudgetCategory}
                onChange={(e) => setSelectedBudgetCategory(e.target.value)}
                className="bg-deep-navy border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">선택 안함 (AI 자동)</option>
                {budgetCategories.map((b) => (
                  <option key={b.category} value={b.category}>
                    {b.category} (배정: {b.allocatedAmount.toLocaleString()}원)
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">📎</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">AI 업로드</h3>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                주간 보고서 또는 영수증을 업로드하면 AI가 자동으로 분석하여 등록합니다.
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

        <FileUploadInput
          onUpload={handleUploads}
          isPending={isPending}
        />
      </div>
    </div>
  )
}
