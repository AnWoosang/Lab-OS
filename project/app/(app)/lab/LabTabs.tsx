'use client'

import { useRouter } from 'next/navigation'

interface Props {
  currentTab: string
}

const TABS = [
  { value: 'projects', label: '프로젝트 관리' },
  { value: 'approval', label: '학생 승인' },
  { value: 'assignment', label: '학생 배정' },
  { value: 'invite', label: '초대 링크' },
]

export default function LabTabs({ currentTab }: Props) {
  const router = useRouter()

  return (
    <nav className="flex flex-col gap-1 w-44 flex-shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => router.push(`/lab?tab=${tab.value}`)}
          className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${
            currentTab === tab.value
              ? 'bg-primary/10 text-primary border-primary'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
