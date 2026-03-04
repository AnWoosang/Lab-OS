'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-800">앱에 문제가 발생했습니다</h1>
          <p className="text-gray-500">예상치 못한 오류가 발생했습니다.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
