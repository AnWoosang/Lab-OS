import Link from 'next/link'
import { GraduationCap, BookOpen, ArrowRight, FlaskConical } from 'lucide-react'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-deep-navy flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Lab-OS</span>
        </Link>
        <span className="text-white/20 mx-2">/</span>
        <span className="text-white/60 text-sm">도움말</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Lab-OS 사용 가이드</h1>
            <p className="text-white/50">역할을 선택하면 맞춤 가이드를 확인할 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Professor Card */}
            <Link
              href="/guide/professor"
              className="group bg-deep-navy-light border border-white/10 rounded-2xl p-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">교수 가이드</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                연구실 생성, 학생 초대, 대시보드 활용, 보고서 및 영수증 관리 방법을 안내합니다.
              </p>
              <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                가이드 보기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Student Card */}
            <Link
              href="/guide/student"
              className="group bg-deep-navy-light border border-white/10 rounded-2xl p-8 hover:border-green-500/40 hover:bg-green-500/5 transition-all"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">학생 가이드</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                초대 링크로 참여하는 방법, 보고서 및 영수증 업로드 방법을 안내합니다.
              </p>
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                가이드 보기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
