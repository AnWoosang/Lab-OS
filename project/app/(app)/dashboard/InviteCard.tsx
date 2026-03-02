'use client'

import { useState } from 'react'
import { Link2, Copy, CheckCircle2, RefreshCw } from 'lucide-react'
import { regenerateJoinCodeAction } from './actions'
import type { WorkspaceConfig } from '@/lib/supabase'

interface Props {
  workspace: WorkspaceConfig
}

export default function InviteCard({ workspace }: Props) {
  const [joinCode, setJoinCode] = useState(workspace.joinCode)
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${joinCode}`
      : `/join/${joinCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setError(null)
    const result = await regenerateJoinCodeAction()
    setIsRegenerating(false)
    setShowConfirm(false)
    if (result.ok && result.joinCode) {
      setJoinCode(result.joinCode)
    } else {
      setError(result.error ?? '알 수 없는 오류')
    }
  }

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-primary" />
        <span className="text-white font-semibold text-sm">학생 초대 링크</span>
        <span className="ml-auto text-white/30 text-xs">{workspace.labName}</span>
      </div>

      <div className="flex items-center gap-3 bg-deep-navy rounded-lg border border-white/10 px-4 py-3 mb-3">
        <span className="text-white/70 text-sm font-mono break-all flex-1 min-w-0">
          /join/{joinCode}
        </span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3 px-1">{error}</p>
      )}

      {showConfirm ? (
        <div className="flex items-center gap-2">
          <p className="text-white/50 text-xs flex-1">기존 링크가 무효화됩니다. 계속하시겠습니까?</p>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 text-white/50 hover:text-white text-xs transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isRegenerating && <RefreshCw className="w-3 h-3 animate-spin" />}
            확인
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          링크 재생성 (유출 시 무효화)
        </button>
      )}
    </div>
  )
}
