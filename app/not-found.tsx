import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center text-center px-4">
      <p className="text-white/30 text-sm font-mono mb-2">404</p>
      <h1 className="text-2xl font-bold text-white mb-4">페이지를 찾을 수 없습니다</h1>
      <Link href="/" className="text-primary hover:text-orange-400 text-sm transition-colors">
        홈으로 돌아가기 →
      </Link>
    </div>
  )
}
