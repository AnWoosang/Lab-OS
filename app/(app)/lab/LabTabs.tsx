'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs'

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
    <Tabs value={currentTab} onValueChange={(value) => router.push(`/lab?tab=${value}`)}>
      <TabsList className="flex-col items-stretch w-44 gap-1">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-left justify-start px-4 py-2.5 rounded-xl text-sm font-medium border-l-2 border-x-0 border-t-0 border-b-0 border-transparent hover:text-white/80 hover:bg-white/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-0 data-[state=active]:border-l-2"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
