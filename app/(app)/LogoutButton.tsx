'use client'

import { LogOut } from 'lucide-react'
import { logoutAction } from './logout-action'
import { useTransition } from 'react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={() => startTransition(() => logoutAction())}
    >
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 w-full px-3 py-2 text-white/40 hover:text-red-400 hover:bg-red-500/5 text-sm transition-colors rounded-xl disabled:opacity-40"
      >
        <LogOut className="w-4 h-4" />
        {isPending ? '로그아웃 중...' : '로그아웃'}
      </button>
    </form>
  )
}
