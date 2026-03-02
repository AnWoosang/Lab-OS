export const dynamic = 'force-static'

import Link from 'next/link'
import { ArrowLeft, FlaskConical, GraduationCap, LayoutDashboard, FileText, Receipt, Link2, RefreshCw, Filter, CreditCard, Settings } from 'lucide-react'

export default function ProfessorGuidePage() {
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
        <span className="text-white/60 text-sm">교수 가이드</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">교수 가이드</h1>
            <p className="text-white/50 text-sm">Lab-OS 시작부터 활용까지</p>
          </div>
        </div>

        <div className="space-y-8">

          <GuideSection number="1" title="처음 시작하기" icon={<FlaskConical className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">첫 로그인 시 연구실 생성 화면이 자동으로 나타납니다.</p>
            <Steps steps={[
              '상단 시작하기 버튼 클릭 → Google 또는 Slack으로 로그인',
              '교수님 카드 선택',
              '연구실 이름 입력 후 생성',
            ]} />
          </GuideSection>

          <GuideSection number="2" title="학생 초대하기" icon={<Link2 className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              대시보드 상단 <strong className="text-white">학생 초대 링크</strong> 카드에서 링크를 복사해 학생에게 공유하세요.
            </p>
            <Steps steps={[
              '복사 버튼으로 초대 링크 복사',
              '카카오톡, 이메일, Slack 등으로 학생에게 전달',
              '학생이 링크 클릭 → 로그인 → 자동 참여',
              '내 연구실 탭 → 학생 승인에서 참여 신청 승인',
            ]} />
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-semibold">링크 변경이 필요할 때</span>
              </div>
              <p className="text-white/60 text-sm">
                링크 재생성 버튼 클릭 → 기존 링크 즉시 무효화 → 새 링크로만 참여 가능
              </p>
            </div>
          </GuideSection>

          <GuideSection number="3" title="대시보드 읽기" icon={<LayoutDashboard className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">대시보드</strong>에서 연구실 전체 현황을 한눈에 볼 수 있습니다.
            </p>
            <div className="space-y-2 mb-4">
              {[
                { color: 'bg-green-400', label: 'On Track', desc: '진도율 80% 이상 — 정상' },
                { color: 'bg-amber-400', label: 'Warning', desc: '진도율 65~79% — 주의' },
                { color: 'bg-red-400', label: 'Red Zone', desc: '진도율 65% 미만 — 즉시 확인' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-white/80 text-sm font-medium w-20">{label}</span>
                  <span className="text-white/40 text-sm">{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-sm">
              프로젝트명을 클릭하면 해당 과제의 보고서 이력, 예산, 병목 상세를 확인할 수 있습니다.
            </p>
          </GuideSection>

          <GuideSection number="4" title="보고서 확인" icon={<FileText className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">보고서</strong> 탭에서 학생이 업로드한 보고서를 확인합니다.
            </p>
            <ul className="space-y-2 text-sm text-white/60 mb-4">
              <li className="flex gap-2"><span className="text-primary">•</span>위험도 순(Red → Yellow → Green)으로 자동 정렬</li>
              <li className="flex gap-2"><span className="text-primary">•</span>AI 요약, 병목 내용, 진도율을 즉시 확인 가능</li>
              <li className="flex gap-2"><span className="text-primary">•</span>원본 링크로 학생이 제출한 실제 파일 열람 가능</li>
            </ul>
            <div className="bg-deep-navy rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span className="text-white/70 text-xs font-semibold">프로젝트별 필터</span>
              </div>
              <p className="text-white/50 text-sm">
                상단 탭에서 특정 과제를 선택하면 해당 프로젝트 보고서만 표시됩니다.
              </p>
            </div>
          </GuideSection>

          <GuideSection number="5" title="영수증 확인" icon={<Receipt className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">영수증</strong> 탭에서 지출 내역을 관리합니다.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-primary">•</span>총 지출액, 의심 영수증 건수를 상단 요약으로 확인</li>
              <li className="flex gap-2"><span className="text-primary">•</span>AI가 연구비 목적과 맞지 않는 항목(주류 등)을 자동 감지해 빨간색으로 표시</li>
              <li className="flex gap-2"><span className="text-primary">•</span>프로젝트 탭으로 과제별 지출 현황 따로 확인 가능</li>
            </ul>
          </GuideSection>

          <GuideSection number="6" title="법인카드 등록 — 영수증 자동 분류" icon={<CreditCard className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              카드 끝 4자리를 등록해두면 학생이 프로젝트를 직접 선택하지 않아도 영수증이 자동으로 분류됩니다.
            </p>
            <Steps steps={[
              '내 연구실 탭 → 프로젝트 관리에서 해당 프로젝트 행 확인',
              '법인카드 끝 4자리 입력 후 저장',
            ]} />
            <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-white/40 text-xs">
                카드 끝 4자리만 저장됩니다. 전체 카드 번호는 시스템에 저장되지 않습니다.
              </p>
            </div>
          </GuideSection>

          <GuideSection number="7" title="프로젝트 관리" icon={<Settings className="w-4 h-4" />}>
            <p className="text-white/60 text-sm mb-3">
              사이드바 <strong className="text-white">내 연구실</strong> → 프로젝트 탭에서 관리합니다.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-primary">•</span>과제코드와 프로젝트명 인라인 편집 가능</li>
              <li className="flex gap-2"><span className="text-primary">•</span>완료 처리하면 완료 탭으로 이동 (데이터는 보존)</li>
              <li className="flex gap-2"><span className="text-primary">•</span>삭제 버튼으로 불필요한 프로젝트 제거 가능</li>
            </ul>
            <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400/80 text-xs font-semibold mb-1">주의</p>
              <p className="text-white/50 text-xs">
                프로젝트 삭제 시 해당 보고서와 영수증 데이터도 함께 삭제됩니다.
              </p>
            </div>
          </GuideSection>

        </div>

        {/* FAQ */}
        <div className="mt-10 bg-deep-navy-light rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            {[
              ['학생이 업로드한 파일을 확인하려면?', '보고서/영수증 탭에서 각 행의 원본 링크를 클릭하세요.'],
              ['프로젝트는 어떻게 만드나요?', '내 연구실 탭 → 프로젝트 탭에서 과제코드를 입력해 직접 생성하세요. 보고서 업로드 시 자동 생성되지 않습니다.'],
              ['여러 연구실을 관리할 수 있나요?', '현재는 계정당 연구실 1개만 지원합니다.'],
              ['법인카드가 없는 프로젝트는?', '학생이 업로드 시 직접 프로젝트를 선택하면 됩니다.'],
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
          <Link href="/guide/student" className="text-white/50 hover:text-white text-sm transition-colors">
            학생 가이드 →
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
        <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center text-primary">{icon}</div>
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
          <span className="w-5 h-5 bg-primary/20 text-primary text-xs font-bold rounded flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
          <span className="text-white/70 text-sm">{step}</span>
        </li>
      ))}
    </ol>
  )
}
