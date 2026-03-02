export const dynamic = 'force-static'

import Link from 'next/link'
import { ArrowLeft, FlaskConical, BookOpen, UploadCloud, Link2 } from 'lucide-react'

export default function StudentGuidePage() {
  return (
    <div className="min-h-screen bg-deep-navy">
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">학생 가이드</h1>
            <p className="text-white/50 text-sm">연구실 참여부터 파일 업로드까지</p>
          </div>
        </div>

        <div className="space-y-8">

          <GuideSection number="1" title="연구실 참여하기" icon={<Link2 className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">교수님에게 초대 링크를 받아야 합니다.</p>
            <Steps steps={[
              '교수님에게 초대 링크 받기 (카카오톡, 이메일 등)',
              '링크 클릭 → 로그인 화면으로 이동',
              'Google 또는 Slack으로 로그인',
              '자동으로 연구실 참여 완료',
            ]} />
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-sm">
                교수님이 참여를 승인해야 업로드 기능을 사용할 수 있습니다. 승인 전까지 대기 화면이 표시됩니다.
              </p>
            </div>
          </GuideSection>

          <GuideSection number="2" title="보고서 업로드하기" icon={<UploadCloud className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">AI 업로드</strong> 탭을 클릭합니다.
            </p>
            <div className="mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs">
                반드시 <strong>본인이 배정된 프로젝트</strong>의 파일만 업로드하세요. 상단 드롭다운에서 프로젝트를 선택하지 않으면 업로드가 진행되지 않습니다.
              </p>
            </div>
            <Steps steps={[
              '상단 드롭다운에서 프로젝트 선택 (필수)',
              '보고서 파일 클릭하여 선택하거나 드래그앤드롭',
              '전송 버튼 클릭',
              '업로드 후 AI 분석까지 수초 대기',
            ]} />
            <div className="mt-4 bg-deep-navy rounded-xl border border-white/10 p-4">
              <p className="text-white/50 text-xs font-semibold mb-2">자동으로 추출되는 정보</p>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                {[
                  ['📊', '진도율'],
                  ['⚠️', '위험도'],
                  ['🔍', '병목 요인'],
                  ['📅', '보고 기간'],
                ].map(([emoji, text]) => (
                  <div key={text} className="flex gap-2 text-white/60">
                    <span>{emoji}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/50 text-xs">
                <strong className="text-white/70">지원 형식:</strong> PDF, JPG, PNG, GIF, WebP · 최대 15MB · 한 번에 최대 5개
              </p>
            </div>
          </GuideSection>

          <GuideSection number="3" title="영수증 업로드하기" icon={<UploadCloud className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              보고서와 같은 <strong className="text-white">AI 업로드</strong> 탭에서 업로드합니다.
            </p>
            <Steps steps={[
              '상단 드롭다운에서 프로젝트 선택 (필수 — 사용한 예산 프로젝트 선택)',
              '영수증 사진 또는 PDF 선택',
              '전송 버튼 클릭',
            ]} />
            <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-xs font-semibold mb-1.5">영수증 촬영 팁</p>
              <ul className="space-y-1 text-white/50 text-xs">
                <li>• 밝은 곳에서 평평하게 놓고 촬영</li>
                <li>• 금액, 날짜, 업체명이 선명하게 보이도록</li>
                <li>• 카드 전표라면 카드번호 끝 4자리도 포함</li>
              </ul>
            </div>
          </GuideSection>

          <GuideSection number="4" title="업로드 이력 확인" icon={<UploadCloud className="w-4 h-4" />}>
            <p className="text-white/60 text-sm">
              업로드 화면 왼쪽 사이드바에서 최근 업로드 이력을 확인할 수 있습니다.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-green-400">•</span>분석 완료 / 오류 상태 표시</li>
              <li className="flex gap-2"><span className="text-green-400">•</span>파일 유형 (보고서 / 영수증)</li>
            </ul>
          </GuideSection>

        </div>

        {/* FAQ */}
        <div className="mt-10 bg-deep-navy-light rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            {[
              ['업로드 후 오류가 뜨면?', '파일이 보고서나 영수증이 맞는지 확인하고, 글씨가 선명한지 확인해주세요. 계속되면 교수님에게 문의하세요.'],
              ['프로젝트가 목록에 없으면?', '교수님에게 프로젝트 생성 및 배정을 요청해주세요.'],
              ['여러 파일을 한번에 올릴 수 있나요?', '네, 최대 5개까지 동시에 업로드 가능합니다.'],
              ['어떤 파일 형식을 지원하나요?', 'PDF, JPG, PNG, GIF, WebP를 지원합니다. 최대 15MB까지 가능합니다.'],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="text-white/80 text-sm font-medium mb-1">Q. {q}</p>
                <p className="text-white/50 text-sm">A. {a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <Link href="/guide" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            가이드 선택으로
          </Link>
          <Link href="/guide/professor" className="text-white/50 hover:text-white text-sm transition-colors">
            교수 가이드 →
          </Link>
        </div>
      </main>
    </div>
  )
}

function GuideSection({ number, title, icon, children }: {
  number: string; title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">{icon}</div>
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
          <span className="w-5 h-5 bg-green-500/10 text-green-400 text-xs font-bold rounded flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
          <span className="text-white/70 text-sm">{step}</span>
        </li>
      ))}
    </ol>
  )
}
