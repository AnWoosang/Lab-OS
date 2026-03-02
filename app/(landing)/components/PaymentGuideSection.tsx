export default function PaymentGuideSection() {
  const steps = [
    {
      number: '1',
      title: '비목 선택',
      description: '소프트웨어 구입비 / DB이용료 / 연구개발서비스 활용비 중 선택',
      tooltip: '학교별 가이드 제공',
      code: 'SW구입비 (411030)'
    },
    {
      number: '2',
      title: '결제 진행',
      description: '법인카드 자동결제 또는 세금계산서 발행 후 이체',
      highlight: '연말 예산 소진용 1년 선결제 가능'
    },
    {
      number: '3',
      title: '서류 자동 발송',
      description: '결제 즉시 조교 이메일로 행정 제출용 서류 패키지 전송',
      hasIcons: true,
      documents: ['견적서', '거래명세서', '사업자등록증', '통장사본', 'SW활용 목적서']
    }
  ]

  return (
    <section id="payment-guide" className="py-16 sm:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(#FF6B35 1px, transparent 1px), linear-gradient(90deg, #FF6B35 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <span className="text-primary text-xs sm:text-sm font-bold">★ 가장 중요한 섹션</span>
          </div>
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            복잡한 행정실 설득,<br />
            <span className="text-primary">저희가 서류로 지원합니다</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-xl">감사 걱정 NO, 증빙 서류 5종 자동 발송</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-12 items-start mb-14 sm:mb-20">
          <div className="md:col-span-3 space-y-4 sm:space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg sm:text-2xl font-bold">{step.number}</span>
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{step.title}</h3>
                      {step.tooltip && (
                        <div className="group relative">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <i className="ri-information-line text-gray-500 text-xs sm:text-sm"></i>
                          </div>
                          <div className="absolute left-0 top-7 sm:top-8 hidden group-hover:block bg-gray-900 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap z-10 shadow-xl">
                            {step.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                    {step.code && (
                      <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-deep-navy/5 rounded-lg">
                        <span className="text-xs sm:text-sm font-mono text-deep-navy">{step.code}</span>
                      </div>
                    )}
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-lg">{step.description}</p>
                    {step.highlight && (
                      <div className="inline-flex items-center space-x-2 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg sm:rounded-xl border border-yellow-200">
                        <i className="ri-star-fill text-yellow-600 text-sm"></i>
                        <span className="text-xs sm:text-sm font-bold text-yellow-900">{step.highlight}</span>
                      </div>
                    )}
                    {step.hasIcons && (
                      <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">자동 발송 서류 5종:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                          {[
                            { icon: 'ri-file-text-line', label: '견적서' },
                            { icon: 'ri-file-list-line', label: '거래명세서' },
                            { icon: 'ri-building-line', label: '사업자등록증' },
                            { icon: 'ri-bank-card-line', label: '통장사본' },
                            { icon: 'ri-file-shield-line', label: 'SW활용 목적서' }
                          ].map((doc, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-1.5 sm:space-y-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                                <i className={`${doc.icon} text-base sm:text-xl text-primary`}></i>
                              </div>
                              <span className="text-[10px] sm:text-xs text-gray-600 text-center font-medium leading-tight">{doc.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 hidden md:block">
            <div className="sticky top-24 space-y-6">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://readdy.ai/api/search-image?query=3D%20illustration%20of%20organized%20document%20stack%20with%20automatic%20email%20sending%20animation%2C%20five%20official%20business%20documents%20flying%20from%20folder%20into%20email%20envelope%20with%20checkmarks%2C%20clean%20professional%20style%20with%20orange%20accent%20color%2C%20modern%20B2B%20SaaS%20design%2C%20white%20background%2C%20paperwork%20automation%20concept&width=500&height=600&seq=payment-docs-003&orientation=portrait"
                  alt="Document Automation"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="bg-gradient-to-br from-deep-navy to-deep-navy-light rounded-xl p-6 text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/20 rounded-full mx-auto mb-3">
                  <i className="ri-shield-check-line text-2xl text-primary"></i>
                </div>
                <p className="text-white font-bold mb-2">국가 R&D 규정 준수</p>
                <p className="text-white/70 text-sm">혁신법 기반 합법적 지출</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Trust Badge */}
        <div className="md:hidden bg-gradient-to-br from-deep-navy to-deep-navy-light rounded-xl p-5 text-center mb-8">
          <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-full mx-auto mb-2">
            <i className="ri-shield-check-line text-xl text-primary"></i>
          </div>
          <p className="text-white font-bold text-sm mb-1">국가 R&D 규정 준수</p>
          <p className="text-white/70 text-xs">혁신법 기반 합법적 지출</p>
        </div>

        {/* Detailed Info Box */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-gray-200">
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary/10 rounded-lg">
              <i className="ri-checkbox-circle-line text-xl sm:text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-gray-900">연구비 지출 가능 항목</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: 'ri-computer-line', color: 'text-blue-600', bg: 'bg-blue-50', title: '소프트웨어 구입/활용비', desc: '연구 데이터 분석 및 프로젝트 관리를 위한 SaaS 툴 이용료', code: '411030' },
              { icon: 'ri-database-2-line', color: 'text-green-600', bg: 'bg-green-50', title: '도서 등 구입비 (DB 이용료)', desc: '연구 데이터베이스 구축 및 클라우드 저장소 활용 비용', code: '411020' },
              { icon: 'ri-service-line', color: 'text-purple-600', bg: 'bg-purple-50', title: '연구개발서비스 활용비', desc: '연구 효율화를 위한 외부 서비스 이용료', code: '412010' },
            ].map((item, index) => (
              <div key={index} className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${item.bg} rounded-lg`}>
                  <i className={`${item.icon} text-2xl sm:text-3xl ${item.color}`}></i>
                </div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-lg">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-base">{item.desc}</p>
                <div className="pt-1 sm:pt-2">
                  <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs font-mono text-gray-700">
                    비목코드: {item.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <button className="px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform flex items-center space-x-2 sm:space-x-3 cursor-pointer whitespace-nowrap shadow-xl shadow-primary/30 mx-auto text-sm sm:text-lg">
            <i className="ri-customer-service-line text-lg sm:text-2xl"></i>
            <span>우리 학교 행정실 기준 문의하기</span>
            <i className="ri-arrow-right-line text-base sm:text-xl"></i>
          </button>
        </div>
      </div>
    </section>
  )
}
