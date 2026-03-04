'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  action: (id: string) => Promise<void>
}

export default function DeleteRowButton({ id, action }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setPending(true)
    try {
      await action(id)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label="삭제"
      className="p-1 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
