import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lab-OS — 연구실 행정 자동화',
  description: '정산 서류 지옥과 가짜 보고서 작성, 오늘로 끝내십시오. 연구는 사람이, 행정은 Lab-OS가 합니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
