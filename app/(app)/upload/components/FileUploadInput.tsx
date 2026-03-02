'use client'

import { useRef, useState, useEffect } from 'react'
import { UploadCloud, Send } from 'lucide-react'

interface Props {
  onUpload: (files: File[]) => void
  isPending: boolean
  disabled?: boolean
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export default function FileUploadInput({ onUpload, isPending, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [justMounted, setJustMounted] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setJustMounted(false), 600)
    return () => clearTimeout(t)
  }, [])

  // Enter 키로 전송
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedFiles.length > 0 && !isPending && !disabled) {
        handleSubmit(selectedFiles)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles, isPending, disabled])

  const handleFiles = (files: File[]) => {
    const valid = files.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= 15 * 1024 * 1024).slice(0, 5)
    if (valid.length > 0) setSelectedFiles(valid)
  }

  const handleSubmit = (files: File[]) => {
    if (files.length === 0 || isPending || disabled) return
    onUpload(files)
    setSelectedFiles([])
    if (inputRef.current) inputRef.current.value = ''
  }

  const openPicker = () => {
    if (!isPending && !disabled) inputRef.current?.click()
  }

  return (
    <div className="border-t border-white/10 bg-deep-navy-light p-4">
      {/* 숨긴 파일 입력 */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 5)
          if (files.length > 0) handleFiles(files)
        }}
      />

      {selectedFiles.length > 0 ? (
        /* ── 파일 선택 후: 파일 목록 + 전송 버튼 ── */
        <div className="flex items-start gap-3">
          <div className="flex-1 bg-deep-navy border border-primary/30 rounded-xl px-4 py-2.5 min-w-0">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="text-base flex-shrink-0">
                  {file.type === 'application/pdf' ? '📄' : '🖼️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/40 text-xs">
                    {(file.size / 1024).toFixed(0)} KB · {file.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit(selectedFiles)}
            disabled={isPending}
            className="p-3 bg-primary text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="업로드"
          >
            {isPending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      ) : (
        /* ── 드롭존: 클릭 or 드래그앤드롭 ── */
        <div
          role="button"
          tabIndex={0}
          aria-label="파일 선택 또는 드래그앤드롭"
          onClick={openPicker}
          onKeyDown={(e) => e.key === 'Enter' && openPicker()}
          onDragOver={(e) => {
            e.preventDefault()
            if (!isPending && !disabled) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const files = Array.from(e.dataTransfer.files).slice(0, 5)
            handleFiles(files)
          }}
          className={[
            'cursor-pointer select-none rounded-xl border-2 border-dashed px-6 py-5',
            'flex flex-col items-center gap-2 transition-all duration-300 outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary/50',
            dragOver
              ? 'border-primary bg-primary/10'
              : justMounted
              ? 'border-primary/50 bg-primary/5'
              : 'border-white/10 hover:border-white/25 hover:bg-white/5',
            isPending || disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          ].join(' ')}
        >
          <UploadCloud
            className={`w-8 h-8 transition-colors ${dragOver ? 'text-primary' : 'text-white/30'}`}
          />
          <p className={`text-sm font-medium transition-colors ${dragOver ? 'text-primary' : 'text-white/50'}`}>
            {dragOver ? '파일을 여기에 놓으세요' : '주간 진행 보고서 또는 지출 영수증 업로드'}
          </p>
          <p className="text-white/25 text-xs">JPG · PNG · PDF · 최대 15MB · 최대 5개</p>
        </div>
      )}

      {selectedFiles.length > 0 && !isPending && (
        <p className="text-white/25 text-xs mt-2 text-center">
          Enter 키 또는 전송 버튼으로 업로드
        </p>
      )}
    </div>
  )
}
