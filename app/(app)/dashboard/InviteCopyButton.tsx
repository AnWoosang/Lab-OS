'use client'
import { useState, useEffect } from 'react'
import { Link2, CheckCircle2 } from 'lucide-react'

interface Props { joinCode: string }

export default function InviteCopyButton({ joinCode }: Props) {
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState(`/join/${joinCode}`)

  useEffect(() => {
    setInviteLink(`${window.location.origin}/join/${joinCode}`)
  }, [joinCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white"
    >
      {copied ? (
        <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">복사됨</span></>
      ) : (
        <><Link2 className="w-3.5 h-3.5" /><span>초대 링크 복사</span></>
      )}
    </button>
  )
}
