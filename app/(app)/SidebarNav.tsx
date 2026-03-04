'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  FileText,
  Receipt,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',  icon: LayoutDashboard, label: '대시보드',    roles: ['professor'] },
  { href: '/reports',    icon: FileText,         label: '보고서',      roles: ['professor'] },
  { href: '/expenses',   icon: Receipt,          label: '영수증',      roles: ['professor'] },
  { href: '/projects',   icon: FolderOpen,       label: '프로젝트',    roles: ['professor'] },
  { href: '/lab',        icon: Settings,         label: '내 연구실',   roles: ['professor'] },
  { href: '/upload',     icon: UploadCloud,      label: 'AI 업로드',    roles: ['professor', 'student'] },
] as const

interface Props {
  role: 'professor' | 'student' | undefined
}

export default function SidebarNav({ role }: Props) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(
    (item) => role && (item.roles as readonly string[]).includes(role)
  )

  return (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {visibleItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname !== null && (pathname === href || pathname.startsWith(href + '/'))
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
