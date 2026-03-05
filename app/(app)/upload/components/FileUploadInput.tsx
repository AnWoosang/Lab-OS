'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Send } from 'lucide-react'
import { LoadingSpinner } from '@/app/(app)/components/LoadingSpinner'

interface Props {
  onUpload: (files: File[]) => void
  isPending: boolean
  disabled?: boolean
}

const ACCEPTED_MIME_TYPES = {
  'image/jpeg': [],
  'image/png': [],
  'image/gif': [],
  'image/webp': [],
  'application/pdf': [],
}

export default function FileUploadInput({ onUpload, isPending, disabled }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
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

  const handleSubmit = (files: File[]) => {
    if (files.length === 0 || isPending || disabled) return
    onUpload(files)
    setSelectedFiles([])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_MIME_TYPES,
    maxSize: 15 * 1024 * 1024,
    multiple: true,
    maxFiles: 5,
    disabled: isPending || disabled,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setSelectedFiles(acceptedFiles.slice(0, 5))
    },
  })

  return (
    <div className="border-t border-white/10 bg-deep-navy-light p-4">
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
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      ) : (
        /* ── 드롭존: 클릭 or 드래그앤드롭 ── */
        <div
          {...getRootProps()}
          className={[
            'cursor-pointer select-none rounded-xl border-2 border-dashed px-6 py-5',
            'flex flex-col items-center gap-2 transition-all duration-300 outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary/50',
            isDragActive
              ? 'border-primary bg-primary/10'
              : justMounted
              ? 'border-primary/50 bg-primary/5'
              : 'border-white/10 hover:border-white/25 hover:bg-white/5',
            isPending || disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <UploadCloud
            className={`w-8 h-8 transition-colors ${isDragActive ? 'text-primary' : 'text-white/30'}`}
          />
          <p className={`text-sm font-medium transition-colors ${isDragActive ? 'text-primary' : 'text-white/50'}`}>
            {isDragActive ? '파일을 여기에 놓으세요' : '주간 진행 보고서 또는 지출 영수증 업로드'}
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
