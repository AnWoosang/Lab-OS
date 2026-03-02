import { Check } from 'lucide-react'

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      label: '개인/소규모 랩',
      price: '월 10만원',
      yearlyPrice: '연 120만원',
      target: '학생 5인 이하, 단독 과제 수행 랩',
      message: '커피값 아껴서 행정 해방',
      features: [
        '기본 진도 관리 (Slack 연동)',
        '영수증 OCR (월 50건 제한)',
        '표준 행정 서류 발급',
        '이메일 지원'
      ],
      buttonText: '시작하기',
      highlighted: false
    },
    {
      name: 'Lab Pro',
      label: '가장 많이 선택',
      price: '월 30만원',
      yearlyPrice: '연 360만원',
      target: '학생 10~20인, 다수 과제(3개 이상) 수행',
      message: '연구비 카드 한도(500만) 내 안전권',
      features: [
        'AI 멘토링 무제한 (학생별 개별 독촉 메일)',
        '영수증/장부 무제한 처리',
        '외부 기업 공유 포털 (현대차/삼성 등)',
        '인건비 자동 산출 (논문/특허 기여도 기반)',
        '전담 기술 지원 (슬랙 채널 초대)'
      ],
      buttonText: '지금 도입하기',
      highlighted: true
    },
    {
      name: 'Research Center',
      label: 'BK21/대형 센터',
      price: '연 1,000만원~',
      yearlyPrice: '(VAT 별도)',
      target: '학생 30인 이상, BK21 사업단, ERC/SRC 센터',
      message: 'BK21 사업단 예산 집행용',
      features: [
        '독립 서버 구축 (데이터 보안 최우선)',
        '대학 행정 시스템(ERP) 연동 커스텀',
        '커스텀 도메인 제공 (lab.kaist.ac.kr 등)',
        '전담 매니저 배정',
        '맞춤형 개발'
      ],
      buttonText: '상담 신청',
      highlighted: false
    }
  ]

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 헤드라인 */}
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            인건비의 1/10 가격으로,
            <br />
            유능한 AI 행정관을 고용하세요
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg">
            연구비 카드(법인) 결제 최적화 | 행정 소요 시간 90% 절감
          </p>
        </div>

        {/* 가격 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-2xl shadow-primary/30 md:-translate-y-4 md:scale-105'
                  : 'border border-gray-200 hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 sm:px-4 py-1 bg-primary text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                    ★ {plan.label}
                  </span>
                </div>
              )}

              {!plan.highlighted && (
                <div className="mb-3 sm:mb-4">
                  <span className="text-gray-500 text-xs sm:text-sm font-medium">{plan.label}</span>
                </div>
              )}

              <div className="mb-4 sm:mb-6 mt-3 sm:mt-4">
                <div className={`text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 ${plan.highlighted ? 'text-primary' : 'text-gray-900'}`}>
                  {plan.price}
                </div>
                {plan.yearlyPrice && (
                  <div className="text-xs sm:text-sm text-gray-500">{plan.yearlyPrice}</div>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <p className="text-gray-600 text-xs sm:text-sm mb-2">{plan.target}</p>
                <div className="inline-block px-3 py-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700 font-medium">{plan.message}</p>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-2.5 sm:py-3 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:scale-105'
                    : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* 비용 효율 비교표 */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-gray-200 mb-12 sm:mb-16">
          <div className="text-center mb-6 sm:mb-10">
            <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              비용 효율 비교: 사람 vs AI
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              행정 직원 1명 고용 vs Lab-OS 도입 시 실제 비용 차이
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-sm sm:text-base font-bold text-gray-900">
                    비교 항목
                  </th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-sm sm:text-base font-bold text-gray-900">
                    행정 직원 고용 (사람)
                  </th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-sm sm:text-base font-bold text-primary">
                    Lab-OS (AI)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">
                    월 비용
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
                    약 250만 원<br />
                    <span className="text-[10px] sm:text-xs text-gray-500">(최저시급+4대보험)</span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-primary">
                    30만 원<br />
                    <span className="text-[10px] sm:text-xs text-primary/70">(Pro 기준)</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">
                    업무 시간
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
                    주 40시간<br />
                    <span className="text-[10px] sm:text-xs text-gray-500">(퇴근 후 연락 불가)</span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-primary">
                    24시간 365일<br />
                    <span className="text-[10px] sm:text-xs text-primary/70">(새벽에도 영수증 처리)</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">
                    업무 범위
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
                    단순 영수증 정리
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-primary">
                    영수증 + 진도 독촉 +<br />인건비 계산 + 기업 응대
                  </td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">
                    숙련도
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
                    매번 가르쳐야 함<br />
                    <span className="text-[10px] sm:text-xs text-gray-500">(이직 잦음)</span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-primary">
                    설치 즉시 전문가<br />
                    <span className="text-[10px] sm:text-xs text-primary/70">(업데이트 무료)</span>
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <td className="py-4 sm:py-5 px-3 sm:px-6 text-xs sm:text-base font-bold text-gray-900">
                    결론
                  </td>
                  <td className="py-4 sm:py-5 px-3 sm:px-6 text-center text-xs sm:text-base font-bold text-red-600">
                    비용 8배 높음
                  </td>
                  <td className="py-4 sm:py-5 px-3 sm:px-6 text-center text-sm sm:text-lg font-bold text-primary">
                    비용 90% 절감 ✓
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-gray-200">
          <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            자주 묻는 질문
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 rounded-lg">
                  <span className="text-primary font-bold text-sm sm:text-base">Q</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 font-bold mb-2 text-sm sm:text-base">
                    월 30만 원(연 360만 원)은 연구비 규정에 맞나요?
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    네, 충분합니다. 국가 R&D 연구비 관리 규정에 따르면, 연구 수행을 돕는 소프트웨어 및 클라우드 서비스 활용비는 연구실 규모와 과제 예산에 따라 탄력적으로 집행할 수 있습니다. 통상적인 기자재(노트북 1대) 가격보다 저렴하여 별도의 심의 없이 <strong>카드 결제(연구활동비)</strong>로 처리가 가능합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 rounded-lg">
                  <span className="text-primary font-bold text-sm sm:text-base">Q</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 font-bold mb-2 text-sm sm:text-base">
                    300만 원이 넘으면 입찰(Bidding)을 해야 하지 않나요?
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    대부분의 대학 산학협력단 규정상 500만 원(또는 1,000만 원) 이하의 물품/용역 구매는 입찰 없이 <strong>수의계약(카드 즉시 결제)</strong>이 가능합니다. Lab-OS의 연간 이용권은 이 한도 내로 책정되어 있어 행정 소요가 없습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 rounded-lg">
                  <span className="text-primary font-bold text-sm sm:text-base">Q</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 font-bold mb-2 text-sm sm:text-base">
                    연말 예산 소진용으로 1년 치 선결제 가능한가요?
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    네, 가능합니다. <strong>연간 이용권</strong>을 선택하시면 12개월 치를 한 번에 결제하고 세금계산서를 발행해 드립니다. 연말 불용액 방지에 효과적입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="text-center text-xs sm:text-sm text-gray-500 space-y-2 mt-8 sm:mt-12">
          <p>모든 요금제 연구비 카드 결제 가능 | 증빙 서류 자동 발송 | 세금계산서 자동 발행</p>
        </div>
      </div>
    </section>
  )
}
