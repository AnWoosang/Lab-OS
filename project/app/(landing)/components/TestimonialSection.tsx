'use client'

import { useState } from 'react'

export default function TestimonialSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const justificationTexts = [
    {
      title: '소프트웨어 활용비 (411030)',
      text: '본 S/W(Lab-OS)는 연구 수행 과정에서 발생하는 방대한 실험 데이터와 기자재 구매 내역을 AI 기반으로 자동 분류 및 데이터베이스화하는 시스템입니다. 이를 통해 연구 데이터의 유실을 방지하고, 연구 진척도를 객관적으로 관리하여 연구 효율성을 높이기 위해 필수적으로 활용하고자 합니다.'
    },
    {
      title: '연구개발서비스 활용비 (412010)',
      text: 'Lab-OS는 연구실 행정 업무 자동화 및 AI 기반 연구 관리 서비스를 제공하는 전문 플랫폼입니다. 연구비 집행 내역 추적, 진도 관리, 다국어 연구원 간 소통 지원 등 연구 효율화를 위한 외부 전문 서비스로서 본 과제 수행에 필수적입니다.'
    }
  ]

  return (
    <section id="payment-guide-detail" className="py-16 sm:py-24 bg-gradient-to-br from-deep-navy via-deep-navy-light to-deep-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(45deg, #FF6B35 1px, transparent 1px), linear-gradient(-45deg, #FF6B35 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-20">
          <div className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-primary/20 rounded-full mb-4 sm:mb-6">
            <span className="text-primary text-xs sm:text-sm font-bold">✓ 국가연구개발혁신법 준수</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            산학협력단 행정, 100% 규정 준수.<br />
            <span className="text-primary">연구비 카드로 복잡한 절차 없이 결제하세요.</span>
          </h2>
          <p className="text-white/70 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            국가연구개발혁신법 매뉴얼에 의거한 정당한 연구 지원 서비스입니다.<br className="hidden sm:block" />
            견적서부터 거래명세서까지, 클릭 한 번으로 자동 발행됩니다.
          </p>
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://readdy.ai/api/search-image?query=3D%20illustration%20of%20research%20fund%20corporate%20credit%20card%20being%20approved%20through%20payment%20terminal%20with%20automatic%20document%20generation%2C%20official%20approval%20stamp%20appearing%2C%20organized%20paperwork%20stack%20with%20checkmarks%2C%20clean%20professional%20academic%20style%20with%20orange%20and%20navy%20colors%2C%20modern%20B2B%20SaaS%20design%2C%20white%20background%2C%20seamless%20payment%20automation%20concept%20for%20university%20research%20administration&width=800&height=400&seq=payment-approval-hero-001&orientation=landscape"
              alt="연구비 카드 결제 자동화"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* 비목 분류 가이드 */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-3 sm:mb-4">
              <span className="text-primary text-xs sm:text-sm font-bold">★ 가장 중요한 선택</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">어떤 비목으로 결제하면 될까요?</h3>
            <p className="text-white/60 text-sm sm:text-lg">과제 성격에 맞는 비목을 선택하세요. 모두 합법적인 지출 항목입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-white/20 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-blue-500/20 rounded-xl mb-4 sm:mb-6">
                <i className="ri-computer-line text-3xl sm:text-4xl text-blue-400"></i>
              </div>
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">연구활동비 (SW활용비)</h4>
                <div className="inline-block px-3 py-1 bg-deep-navy/50 rounded-lg">
                  <span className="text-xs sm:text-sm font-mono text-primary">비목코드: 411030</span>
                </div>
              </div>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                가장 일반적인 결제 방식입니다. 연구 데이터 관리 및 분석을 위한 소프트웨어 라이선스 비용으로 처리하세요.
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-primary text-xs sm:text-sm font-semibold">
                  <i className="ri-checkbox-circle-fill"></i>
                  <span>추천: 일반 개인 과제, 소규모 랩</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 relative">
              <div className="absolute -top-3 -right-3 bg-primary text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-lg text-xs sm:text-sm font-bold">인기</div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/20 rounded-xl mb-4 sm:mb-6">
                <i className="ri-service-line text-3xl sm:text-4xl text-primary"></i>
              </div>
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">연구개발서비스 활용비</h4>
                <div className="inline-block px-3 py-1 bg-deep-navy/50 rounded-lg">
                  <span className="text-xs sm:text-sm font-mono text-primary">비목코드: 412010</span>
                </div>
              </div>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                연구 효율화를 위해 외부 전문 서비스를 활용하는 비용입니다. AI 에이전트 기능을 강조하여 처리 가능합니다.
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-primary text-xs sm:text-sm font-semibold">
                  <i className="ri-checkbox-circle-fill"></i>
                  <span>추천: 대형 과제, 산학 과제</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-white/20 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-green-500/20 rounded-xl mb-4 sm:mb-6">
                <i className="ri-database-2-line text-3xl sm:text-4xl text-green-400"></i>
              </div>
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">도서 등 구입비 (DB이용료)</h4>
                <div className="inline-block px-3 py-1 bg-deep-navy/50 rounded-lg">
                  <span className="text-xs sm:text-sm font-mono text-primary">비목코드: 411020</span>
                </div>
              </div>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                연구 데이터베이스 구축 및 클라우드 아카이빙 비용으로 분류 가능합니다.
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-primary text-xs sm:text-sm font-semibold">
                  <i className="ri-checkbox-circle-fill"></i>
                  <span>추천: 데이터 축적 중심 과제</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4단계 결제 액션 플랜 */}
        <div className="mb-16 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">4단계로 끝나는 결제 프로세스</h3>
            <p className="text-white/60 text-sm sm:text-lg">복잡한 절차 없이, 클릭 몇 번으로 모든 행정이 완료됩니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: '1', title: '견적서 발행', desc: '홈페이지 [Pricing] 메뉴에서 원하는 플랜(월/연간)을 선택하고 \'견적서 받기\'를 누르세요. 이메일로 즉시 발송됩니다.' },
              { step: '2', title: '연구비 카드 결제', desc: '받으신 견적서를 토대로 산학협력단 카드로 온라인 결제를 진행하세요. (빌링 결제 지원)' },
              { step: '3', title: '증빙 서류 자동 수신', desc: '결제와 동시에 5종 행정 서류(거래명세서, 영수증, 사업자등록증, 통장사본, 견적서)가 담당자 메일로 자동 발송됩니다.' },
              { step: '4', title: '산단 제출', desc: '이메일로 온 압축파일(.zip)을 그대로 산학협력단 시스템(ERP)에 업로드하면 행정 끝!' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-white/20 hover:border-primary transition-all duration-300 h-full">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-orange-600 rounded-xl mb-4 sm:mb-6 shadow-lg">
                    <span className="text-white text-xl sm:text-2xl font-bold">{item.step}</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </div>
                {index < 3 && (
                  <>
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary text-2xl">
                      <i className="ri-arrow-right-line"></i>
                    </div>
                    <div className="md:hidden flex justify-center my-4 text-primary text-2xl">
                      <i className="ri-arrow-down-line"></i>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 flex items-center space-x-2 sm:space-x-3 cursor-pointer whitespace-nowrap mx-auto text-sm sm:text-base">
              <i className="ri-file-text-line text-lg sm:text-xl"></i>
              <span>표준 견적서 양식 미리보기</span>
              <i className="ri-download-line text-base sm:text-lg"></i>
            </button>
          </div>
        </div>

        {/* 행정 설득용 치트키 */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-yellow-500/20 rounded-full mb-3 sm:mb-4">
              <span className="text-yellow-400 text-xs sm:text-sm font-bold">💡 행정실 설득 치트키</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              행정실 제출용 &apos;활용 목적 설명서&apos;도 써 드립니다.
            </h3>
            <p className="text-white/60 text-sm sm:text-lg">&ldquo;이거 왜 사요?&rdquo;라는 질문에 바로 답할 수 있는 문구를 복사하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {justificationTexts.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-bold text-white">{item.title}</h4>
                  <button
                    onClick={() => copyToClipboard(item.text, index)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer whitespace-nowrap text-xs sm:text-sm font-semibold"
                  >
                    <i className={`${copiedIndex === index ? 'ri-check-line' : 'ri-file-copy-line'} text-sm sm:text-base`}></i>
                    <span>{copiedIndex === index ? '복사됨!' : '복사'}</span>
                  </button>
                </div>
                <div className="bg-deep-navy/50 rounded-xl p-4 sm:p-5 border border-white/10">
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border-2 border-white/10">
          <h3 className="text-xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">자주 묻는 질문</h3>
          <div className="space-y-4 sm:space-y-6">
            {[
              { q: '이번 달 연구비가 남았는데, 1년 치 미리 결제(선결제) 되나요?', a: '네, 가능합니다. [연간 이용권] 견적서를 선택하시면 12개월 치를 한 번에 결제하고 세금계산서를 발행해 드립니다. 연말 불용액 방지에 효과적입니다.' },
              { q: '행정실에서 추가 서류를 요청하면 어떻게 하나요?', a: '행정 서류 관련 문의는 admin@lab-os.com으로 주시면 산학협력단 담당자와 직접 소통해 드립니다. 필요한 서류는 즉시 재발행 가능합니다.' },
              { q: '법인카드 자동결제(빌링)도 지원하나요?', a: '네, 월간 이용권의 경우 법인카드 자동결제를 지원합니다. 매월 자동으로 결제되며, 증빙 서류도 자동 발송됩니다.' },
            ].map((faq, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 rounded-lg">
                    <span className="text-primary font-bold text-sm sm:text-base">Q</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-2 text-sm sm:text-base">{faq.q}</h4>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <button className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform flex items-center space-x-3 cursor-pointer whitespace-nowrap shadow-2xl shadow-primary/40 mx-auto text-base sm:text-lg">
            <i className="ri-customer-service-2-line text-xl sm:text-2xl"></i>
            <span>우리 학교 행정실 기준 문의하기</span>
            <i className="ri-arrow-right-line text-lg sm:text-xl"></i>
          </button>
          <p className="text-white/50 text-xs sm:text-sm mt-4">평균 응답 시간: 2시간 이내 | 전담 행정 컨설턴트 배정</p>
        </div>
      </div>
    </section>
  )
}
