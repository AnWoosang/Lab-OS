import Link from 'next/link'
import { cookies } from 'next/headers'
import { FlaskConical, ArrowLeft } from 'lucide-react'
import LogoutButton from './LogoutButton'
import SidebarNav from './SidebarNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = cookieStore.get('lab_role')?.value as 'professor' | 'student' | undefined

  return (
    <div className="min-h-screen bg-deep-navy flex">
      {/* Sidebar */}
      <aside className="w-64 bg-deep-navy-light border-r border-white/10 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Lab-OS</span>
          {role && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
              role === 'professor'
                ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                : 'text-green-400 border-green-500/30 bg-green-500/10'
            }`}>
              {role === 'professor' ? '교수' : '학생'}
            </span>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav role={role} />

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white/60 text-sm transition-colors rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
