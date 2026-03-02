'use client'

import { ArrowRight, Check, ArrowDown } from 'lucide-react'

interface AuthProfile {
  role: 'professor' | 'student'
}

interface Props {
  profile?: AuthProfile | null
}

export default function HeroSection({ profile }: Props) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const myLabHref = profile?.role === 'professor' ? '/dashboard' : '/upload'

  return (
    <section id="hero" className="relative min-h-screen bg-deep-navy overflow-hidden">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#FF6B35 1px, transparent 1px), linear-gradient(90deg, #FF6B35 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 flex items-center min-h-screen">
        <div className="w-full">
          {/* Trust Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                해외 베트남 연구원 50명 이상을 성공적으로 졸업시킨 검증된 시스템
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center space-y-4 sm:space-y-6 mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-white">정산 서류 지옥과</span>
              <br />
              <span className="text-white">가짜 보고서 작성,</span>
              <br />
              <span className="text-primary">오늘로 끝내십시오.</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/70 font-light">
              연구는 사람이, 행정은 Lab-OS가 합니다.
            </p>
          </div>

          {/* Split View: Before & After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-10 sm:mb-12">
            {/* Before - Grayscale */}
            <div className="relative group">
              <div className="absolute -top-3 sm:-top-4 left-3 sm:left-4 z-10">
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-600 group-hover:bg-gray-500 text-white text-xs sm:text-sm font-bold rounded-full transition-colors duration-500">
                  BEFORE
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-gray-600 grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:border-gray-400 group-hover:shadow-xl group-hover:shadow-white/10 cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://readdy.ai/api/search-image?query=Stressed%20graduate%20student%20buried%20under%20massive%20piles%20of%20crumpled%20paper%20receipts%20and%20messy%20excel%20spreadsheets%20in%20dark%20university%20laboratory%20at%20night%2C%20cluttered%20desk%20with%20coffee%20cups%2C%20frustrated%20expression%2C%20dim%20fluorescent%20lighting%2C%20realistic%20photography%20style%2C%20academic%20research%20environment%2C%20chaotic%20workspace%20with%20documents%20everywhere&width=600&height=500&seq=hero-before-002&orientation=landscape"
                  alt="Before Lab-OS"
                  className="w-full h-56 sm:h-80 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <p className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">정산 서류 지옥</p>
                  <p className="text-white/80 text-xs sm:text-sm group-hover:text-white/95 transition-colors duration-500">
                    과제 종료 후 산학협력단 제출용 서류 정리에 한 달
                  </p>
                </div>
              </div>
            </div>

            {/* After - Colorful */}
            <div className="relative group">
              <div className="absolute -top-3 sm:-top-4 left-3 sm:left-4 z-10">
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary group-hover:bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full transition-colors duration-500">
                  AFTER
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-primary shadow-lg shadow-primary/20 group-hover:shadow-2xl group-hover:shadow-primary/40 group-hover:border-orange-400 transition-all duration-700 ease-out cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://readdy.ai/api/search-image?query=16:9%20wide%20hero%20banner%20ultra%20high-end%20SaaS%20product%20promo%20visual%20photorealistic%20studio%20render.%20Foreground%20realistic%20modern%20smartphone%20iPhone%20style%20black%20bezel%20centered%20slightly%20angled%20crisp%20reflections%20shallow%20depth%20of%20field.%20On%20phone%20screen%20Slack%20dark-mode%20interface%20with%20large%20card%20showing%20Upload%20your%20receipt%20Upload%20your%20report%20style%20with%20small%20thumbnail%20image%20of%20laboratory%20desk%20scene%20isometric%20illustration%20inside%20card%20subtle%20checkmark%20icon%20and%20progress%20indicator.%20Background%20softly%20blurred%20UI%20dashboard%20panels%20charts%20cards%20analytics%20in%20cool%20tones%20deep%20navy%20teal%20purple%20glassmorphism%20panels%20bokeh%20cinematic%20lighting.%20Bottom%20overlay%20dark%20translucent%20gradient%20bar%20with%20Korean%20typography.%20Headline%20large%20bold%20white%20%EC%82%AC%EC%A7%84%20%ED%95%9C%20%EC%9E%A5%EC%9C%BC%EB%A1%9C%20%EC%99%84%EB%A3%8C.%20Subheadline%20smaller%20white%20gray%20%EC%8A%AC%EB%9E%99%EC%97%90%20%EC%98%AC%EB%A6%AC%EB%A9%B4%20AI%EA%B0%80%20%EC%9E%90%EB%8F%99%EC%9C%BC%EB%A1%9C%20%EC%82%B0%ED%95%99%ED%98%91%EB%A0%A5%EB%8B%A8%20%EC%96%91%EC%8B%9D%20%EC%99%84%EC%84%B1.%20Style%20premium%20clean%20minimal%20Apple-like%20product%20marketing%20high%20contrast%204K%20sharp%20details%20on%20phone%20background%20heavily%20blurred%20no%20clutter%20no%20watermark%20no%20extra%20borders&width=600&height=500&seq=hero-after-premium-001&orientation=landscape"
                  alt="After Lab-OS"
                  className="w-full h-56 sm:h-80 object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-primary rounded-full">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <p className="text-white font-bold text-sm sm:text-base drop-shadow-lg">사진 한 장으로 행정 완료</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits - Data Style */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10 sm:mb-12 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/10 text-center">
              <div className="text-xl sm:text-3xl font-mono font-bold text-primary mb-0.5 sm:mb-1">2시간</div>
              <div className="text-white/60 text-xs sm:text-sm">→ 10초</div>
              <div className="text-white/80 text-[10px] sm:text-xs mt-1 sm:mt-2">영수증 정리 시간</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/10 text-center">
              <div className="text-xl sm:text-3xl font-mono font-bold text-primary mb-0.5 sm:mb-1">100%</div>
              <div className="text-white/60 text-xs sm:text-sm">자동화</div>
              <div className="text-white/80 text-[10px] sm:text-xs mt-1 sm:mt-2">증빙 서류 발송</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/10 text-center">
              <div className="text-xl sm:text-3xl font-mono font-bold text-primary mb-0.5 sm:mb-1">0건</div>
              <div className="text-white/60 text-xs sm:text-sm">행정 반려</div>
              <div className="text-white/80 text-[10px] sm:text-xs mt-1 sm:mt-2">감사 걱정 제로</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            {profile ? (
              <a
                href={myLabHref}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap shadow-lg shadow-primary/30 text-sm sm:text-base"
              >
                <span>내 연구실 바로가기</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <a
                href="/login"
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap shadow-lg shadow-primary/30 text-sm sm:text-base"
              >
                <span>무료로 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => scrollToSection('payment-guide')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base"
            >
              연구비 결제 가이드 보기
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-white/50" />
      </div>
    </section>
  )
}
