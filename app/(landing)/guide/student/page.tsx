export const dynamic = 'force-static'

import Link from 'next/link'
import { ArrowLeft, FlaskConical, BookOpen, UploadCloud, Link2, FileText, Receipt, CreditCard } from 'lucide-react'

export default function StudentGuidePage() {
  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Lab-OS</span>
        </Link>
        <span className="text-white/20 mx-2">/</span>
        <Link href="/guide" className="text-white/60 hover:text-white text-sm transition-colors">도움말</Link>
        <span className="text-white/20 mx-2">/</span>
        <span className="text-white/60 text-sm">학생 가이드</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">학생 가이드북</h1>
            <p className="text-white/50 text-sm">Lab-OS 학생 기능 완전 안내</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <GuideSection number="1" title="초대 링크로 참여하기" icon={<Link2 className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">교수님에게 초대 링크를 받아 연구실에 참여합니다.</p>
            <Steps steps={[
              '교수님에게 초대 링크 수령 (예: lab-os.com/join/ABC123)',
              '링크 클릭',
              '로그인이 안 되어 있으면 Google 로그인 화면으로 이동',
              '로그인 완료 후 자동으로 연구실에 참여 → 업로드 페이지로 이동',
            ]} />
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-sm">
                초대 코드만 있는 경우: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/onboarding</code> 접속 → 학생 선택 → 코드 직접 입력도 가능합니다.
              </p>
            </div>
          </GuideSection>

          {/* Section 2 */}
          <GuideSection number="2" title="첫 로그인 방법" icon={<FlaskConical className="w-4 h-4" />}>
            <Steps steps={[
              'lab-os.com 접속 → 시작하기 클릭',
              'Google로 로그인 클릭',
              '사용할 Google 계정 선택',
              '교수님의 초대 링크로 이미 이동했다면 자동으로 참여 처리',
            ]} />
          </GuideSection>

          {/* Section 3 */}
          <GuideSection number="3" title="보고서 업로드하기" icon={<FileText className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">파일 업로드</strong> 클릭.
            </p>
            <Steps steps={[
              '파일 선택 클릭 → 보고서 파일 선택',
              '필요 시 드롭다운에서 프로젝트 선택',
              '업로드 버튼 클릭',
              'AI 분석 완료까지 수초 대기',
            ]} />
            <div className="mt-4 bg-deep-navy rounded-xl border border-white/10 p-4">
              <p className="text-white/50 text-xs font-semibold mb-2">AI가 자동으로 추출하는 정보</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ['📋', '과제 코드 / 프로젝트명'],
                  ['📊', '진도율 (0~100%)'],
                  ['⚠️', '위험도 (On Track / Warning / Red Zone)'],
                  ['🔍', '병목 요인 (지연 원인)'],
                  ['📅', '보고 기간'],
                ].map(([emoji, text]) => (
                  <div key={text} className="flex gap-2 text-white/60">
                    <span>{emoji}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">
                <strong className="text-white/70">지원 형식:</strong> PDF, JPG, PNG, GIF, WebP · 최대 20MB
              </p>
            </div>
          </GuideSection>

          {/* Section 4 */}
          <GuideSection number="4" title="영수증 업로드하기" icon={<Receipt className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">보고서와 동일한 <strong className="text-white">파일 업로드</strong> 페이지를 사용합니다.</p>
            <Steps steps={[
              '파일 선택 → 영수증 파일/사진 선택',
              'AI가 자동으로 영수증임을 인식',
              '업로드 버튼 클릭',
            ]} />
            <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs font-semibold">법인카드 자동 인식</span>
              </div>
              <p className="text-white/50 text-sm">
                교수님이 법인카드 끝 4자리를 등록해두었다면, 프로젝트를 직접 선택하지 않아도 영수증이 자동으로 해당 프로젝트에 분류됩니다.
              </p>
            </div>
            <div className="mt-3 bg-deep-navy rounded-xl border border-white/10 p-4">
              <p className="text-white/50 text-xs font-semibold mb-2">AI가 자동으로 추출하는 정보</p>
              <div className="space-y-1.5 text-sm">
                {[
                  ['🏪', '업체명'],
                  ['💰', '금액'],
                  ['📂', '카테고리 (식비, 교통비, 소모품 등)'],
                  ['🧾', '예산 코드'],
                  ['💳', '카드 끝 4자리 (자동 프로젝트 매핑)'],
                  ['⚠️', '의심 여부 (부적합 항목 자동 감지)'],
                ].map(([emoji, text]) => (
                  <div key={text} className="flex gap-2 text-white/60">
                    <span>{emoji}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <p className="text-green-400/80 text-xs font-semibold mb-1">영수증 촬영 팁</p>
              <ul className="space-y-1 text-white/50 text-xs">
                <li>• 밝은 곳에서 평평하게 펼쳐 촬영</li>
                <li>• 금액, 날짜, <strong className="text-white/70">카드 정보</strong>가 선명하게 보이도록</li>
                <li>• PDF 스캔 파일도 사용 가능</li>
              </ul>
            </div>
          </GuideSection>

          {/* Section 5 */}
          <GuideSection number="5" title="업로드 이력 확인" icon={<UploadCloud className="w-4 h-4" />}>
            <p className="text-white/60 text-sm">
              업로드 페이지 오른쪽 사이드바에서 최근 업로드 이력을 확인할 수 있습니다.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-green-400">•</span>각 업로드의 상태 (분석 중 / 완료 / 오류)</li>
              <li className="flex gap-2"><span className="text-green-400">•</span>분석 결과 요약</li>
              <li className="flex gap-2"><span className="text-green-400">•</span>파일 유형 (보고서 / 영수증)</li>
            </ul>
          </GuideSection>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/guide"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            가이드 선택으로
          </Link>
          <Link
            href="/guide/professor"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            교수 가이드 →
          </Link>
        </div>
      </main>
    </div>
  )
}

function GuideSection({
  number,
  title,
  icon,
  children,
}: {
  number: string
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
          {icon}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-white/30 text-sm font-mono">{number}.</span>
          <h2 className="text-white font-bold">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-5 h-5 bg-green-500/10 text-green-400 text-xs font-bold rounded flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span className="text-white/70 text-sm">{step}</span>
        </li>
      ))}
    </ol>
  )
}
