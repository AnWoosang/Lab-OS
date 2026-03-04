'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800">오류가 발생했습니다</h1>
        <p className="text-gray-500 text-sm">{error.message || '예상치 못한 오류입니다.'}</p>
        {error.digest && (
          <p className="text-xs text-gray-400">오류 ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
