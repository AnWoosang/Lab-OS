export const dynamic = 'force-static'

import Link from 'next/link'
import { ArrowLeft, FlaskConical, GraduationCap, LayoutDashboard, FileText, Receipt, Link2, RefreshCw, Filter, CreditCard } from 'lucide-react'

export default function ProfessorGuidePage() {
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
        <span className="text-white/60 text-sm">교수 가이드</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">교수 가이드북</h1>
            <p className="text-white/50 text-sm">Lab-OS 교수 기능 완전 안내</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <GuideSection
            number="1"
            title="시작하기 — 로그인"
            icon={<FlaskConical className="w-4 h-4" />}
          >
            <Steps steps={[
              'lab-os.com 접속',
              '우측 상단 시작하기 클릭',
              'Google로 로그인 버튼 클릭',
              'Google 계정 선택 후 인증 완료',
            ]} />
          </GuideSection>

          {/* Section 2 */}
          <GuideSection
            number="2"
            title="연구실 온보딩 — 연구실 생성"
            icon={<FlaskConical className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">최초 로그인 시 온보딩 화면이 자동으로 표시됩니다.</p>
            <Steps steps={[
              '교수님 카드 선택',
              '연구실 이름 입력 (예: 김철수 연구실)',
              '연구실 생성 버튼 클릭',
              '생성 완료 후 초대 링크 화면 표시',
            ]} />
          </GuideSection>

          {/* Section 3 */}
          <GuideSection
            number="3"
            title="초대 링크 생성 및 학생에게 공유"
            icon={<Link2 className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">
              연구실 생성 직후, 또는 대시보드 상단의 <strong className="text-white">학생 초대 링크</strong> 카드에서 확인할 수 있습니다.
            </p>
            <Steps steps={[
              '복사 버튼으로 링크 복사',
              '학생에게 링크 공유 (카카오톡, 이메일, Slack 등)',
              '학생이 링크 클릭 → Google 로그인 후 자동 참여',
            ]} />
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-semibold">학생 교체 시</span>
              </div>
              <p className="text-white/60 text-sm">
                대시보드 초대 링크 카드 하단 &ldquo;링크 재생성&rdquo; 클릭 → 기존 링크 무효화 → 새 링크 공유
              </p>
            </div>
          </GuideSection>

          {/* Section 4 */}
          <GuideSection
            number="4"
            title="대시보드 이해하기"
            icon={<LayoutDashboard className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/dashboard</code>에서 연구실 전체 현황을 확인합니다.
            </p>
            <div className="bg-deep-navy rounded-xl border border-white/10 overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-2.5 text-white/40 text-xs">카드</th>
                    <th className="text-left px-4 py-2.5 text-white/40 text-xs">설명</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['전체 프로젝트', '등록된 과제 수'],
                    ['🔴 Red Zone', '진도율 65% 미만 과제 수'],
                    ['🟡 Warning', '진도율 65~79% 과제 수'],
                    ['예산 사용률', '전체 예산 소진 비율'],
                  ].map(([card, desc]) => (
                    <tr key={card} className="border-b border-white/5">
                      <td className="px-4 py-2.5 text-white/80 font-medium">{card}</td>
                      <td className="px-4 py-2.5 text-white/50">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2">
              {[
                { color: 'bg-green-400', label: 'On Track', desc: '진도율 80% 이상 — 정상' },
                { color: 'bg-amber-400', label: 'Warning', desc: '진도율 65~79% — 주의 필요' },
                { color: 'bg-red-400', label: 'Red Zone', desc: '진도율 65% 미만 — 즉시 확인 필요' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                  <span className="text-white/40 text-sm">— {desc}</span>
                </div>
              ))}
            </div>
          </GuideSection>

          {/* Section 5 */}
          <GuideSection
            number="5"
            title="보고서 확인 — /reports"
            icon={<FileText className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">사이드바 <strong className="text-white">보고서</strong> 클릭.</p>
            <ul className="space-y-2 text-sm text-white/60 mb-4">
              <li className="flex gap-2"><span className="text-primary">•</span>워크스페이스 전체 보고서를 위험도 순(Red → Yellow → Green)으로 정렬</li>
              <li className="flex gap-2"><span className="text-primary">•</span>컬럼: 날짜 / 프로젝트 / 진도율 바 / 위험도 배지 / 병목 요약 / 원본 파일</li>
              <li className="flex gap-2"><span className="text-primary">•</span>원본 링크로 학생이 업로드한 실제 파일 확인 가능</li>
            </ul>
            <div className="bg-deep-navy rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span className="text-white/70 text-xs font-semibold">프로젝트 탭 필터</span>
              </div>
              <p className="text-white/50 text-sm">
                상단 탭에서 프로젝트를 선택하면 해당 과제의 보고서만 표시됩니다.
                <strong className="text-white"> [전체보기]</strong>로 전체 보기로 돌아올 수 있습니다.
              </p>
            </div>
          </GuideSection>

          {/* Section 6 */}
          <GuideSection
            number="6"
            title="영수증 확인 — /expenses"
            icon={<Receipt className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">사이드바 <strong className="text-white">영수증</strong> 클릭.</p>
            <ul className="space-y-2 text-sm text-white/60 mb-4">
              <li className="flex gap-2"><span className="text-primary">•</span>상단 요약: 총 지출액, 의심 영수증 건수 (선택된 뷰 기준)</li>
              <li className="flex gap-2"><span className="text-primary">•</span>의심 영수증은 빨간 배경으로 하이라이트</li>
              <li className="flex gap-2"><span className="text-primary">•</span>AI가 연구비 부적합 항목(주류 등)을 자동 감지</li>
            </ul>
            <div className="bg-deep-navy rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <span className="text-white/70 text-xs font-semibold">프로젝트 탭 필터</span>
              </div>
              <p className="text-white/50 text-sm">
                프로젝트 탭을 선택하면 해당 과제의 영수증만 표시되며,
                총 지출액과 의심 건수 요약도 해당 프로젝트 기준으로 자동 갱신됩니다.
              </p>
            </div>
          </GuideSection>

          {/* Section 7 */}
          <GuideSection
            number="7"
            title="법인카드 설정 — 자동 프로젝트 매핑"
            icon={<CreditCard className="w-4 h-4" />}
          >
            <p className="text-white/60 text-sm mb-3">
              한국 대학 연구과제는 프로젝트당 법인카드가 1장씩 발급됩니다.
              카드 끝 4자리를 등록하면 학생이 프로젝트를 선택하지 않아도 영수증이 자동으로 분류됩니다.
            </p>
            <Steps steps={[
              '프로젝트 상세 페이지 접속 (사이드바 프로젝트 → 과제명 클릭)',
              '법인카드 설정 카드에서 카드 끝 4자리 입력 (예: 1234)',
              '저장 버튼 클릭 — ✓ 저장됨 메시지 확인',
            ]} />
            <div className="mt-4 space-y-3">
              <div className="bg-deep-navy rounded-xl border border-white/10 p-4">
                <p className="text-white/50 text-xs font-semibold mb-2">자동 매핑 우선순위</p>
                <ol className="space-y-1.5 text-sm text-white/60">
                  <li className="flex gap-2"><span className="text-primary font-mono text-xs">①</span>학생이 업로드 시 직접 선택한 프로젝트</li>
                  <li className="flex gap-2"><span className="text-primary font-mono text-xs">②</span>영수증 카드 끝 4자리 자동 매핑 (법인카드 등록 시)</li>
                  <li className="flex gap-2"><span className="text-primary font-mono text-xs">③</span>영수증 예산 코드 기반 매핑</li>
                </ol>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white/40 text-xs">
                  카드 끝 4자리만 저장됩니다. 전체 카드 번호는 시스템에 저장되지 않습니다.
                </p>
              </div>
            </div>
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
            href="/guide/student"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            학생 가이드 →
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
        <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
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
          <span className="w-5 h-5 bg-primary/20 text-primary text-xs font-bold rounded flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span className="text-white/70 text-sm">{step}</span>
        </li>
      ))}
    </ol>
  )
}
