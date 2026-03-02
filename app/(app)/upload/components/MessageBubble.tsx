'use client'

import { FileText, Image, Loader2, CheckCircle2, AlertTriangle, Receipt } from 'lucide-react'

export interface MessageItem {
  id: string
  type: 'file_upload' | 'result'
  // file_upload fields
  fileName?: string
  fileSize?: number
  // result fields
  status?: 'uploading' | 'processing' | 'done' | 'error'
  resultType?: 'report' | 'expense' | 'unknown'
  message?: string
  errorMsg?: string
  createdAt: Date
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function FileIcon({ fileName }: { fileName: string }) {
  const isPdf = fileName?.toLowerCase().endsWith('.pdf')
  return isPdf ? (
    <FileText className="w-5 h-5 text-blue-400" />
  ) : (
    <Image className="w-5 h-5 text-purple-400" />
  )
}

export default function MessageBubble({ msg }: { msg: MessageItem }) {
  if (msg.type === 'file_upload') {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileIcon fileName={msg.fileName ?? ''} />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{msg.fileName}</p>
              {msg.fileSize !== undefined && (
                <p className="text-white/40 text-xs">{formatBytes(msg.fileSize)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result bubble (system side)
  if (msg.status === 'uploading') {
    return (
      <div className="flex justify-start mb-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
            <span className="text-white/60 text-sm">업로드 중...</span>
          </div>
        </div>
      </div>
    )
  }

  if (msg.status === 'processing') {
    return (
      <div className="flex justify-start mb-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
            <span className="text-white/60 text-sm">AI 분석 중...</span>
          </div>
        </div>
      </div>
    )
  }

  if (msg.status === 'error') {
    return (
      <div className="flex justify-start mb-3">
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">분석 실패</p>
              <p className="text-white/50 text-xs mt-0.5">{msg.errorMsg || '오류가 발생했습니다.'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Done
  const isReport = msg.resultType === 'report'
  const isExpense = msg.resultType === 'expense'

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isReport ? 'bg-blue-500/20' : isExpense ? 'bg-green-500/20' : 'bg-white/10'
            }`}
          >
            {isReport ? (
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            ) : isExpense ? (
              <Receipt className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium">
              {isReport ? '보고서 분석 완료' : isExpense ? '영수증 등록 완료' : '알 수 없는 파일'}
            </p>
            {msg.message && (
              <p className="text-white/60 text-xs mt-1 leading-relaxed whitespace-pre-line">
                {msg.message}
              </p>
            )}
            {!isReport && !isExpense && (
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                {msg.errorMsg || '보고서나 영수증 파일을 올려주세요.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
