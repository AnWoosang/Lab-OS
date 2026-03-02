import { Camera, Bell, CircleDollarSign, ShieldCheck, type LucideIcon } from 'lucide-react'

export default function FeaturesSection() {
  const features: {
    badge: string
    title: string
    description: string
    Icon: LucideIcon
    stats: { value: string; label: string }
    image: string
  }[] = [
    {
      badge: 'Snapshot to Ledger',
      title: '찍으면, 장부 정리 끝',
      description:
        '슬랙에 영수증 사진만 올리세요. AI가 날짜, 금액, 품목을 읽어 산학협력단 제출용 양식으로 자동 변환합니다.',
      Icon: Camera,
      stats: { value: '10초', label: '평균 처리 시간' },
      image:
        'https://readdy.ai/api/search-image?query=Smartphone%20taking%20photo%20of%20paper%20receipt%20transforming%20into%20organized%20digital%20spreadsheet%20with%20automatic%20data%20extraction%2C%20OCR%20technology%20visualization%2C%20clean%20modern%20interface%20showing%20date%20amount%20and%20item%20fields%20being%20filled%20automatically%2C%20professional%20B2B%20SaaS%20design%2C%20bright%20lighting%2C%20simple%20white%20background&width=600&height=400&seq=feature-ocr-003&orientation=landscape',
    },
    {
      badge: 'Active Nudge',
      title: '교수님 대신 잔소리하는 AI',
      description:
        '진도가 늦어지는 학생에게만 AI가 메일을 보냅니다. 교수님은 "빨간불" 켜진 프로젝트만 확인하세요.',
      Icon: Bell,
      stats: { value: '자동', label: '진도 모니터링' },
      image:
        'https://readdy.ai/api/search-image?query=AI%20assistant%20sending%20automated%20email%20notification%20to%20student%20with%20gentle%20reminder%20message%2C%20dashboard%20showing%20red%20alert%20flag%20on%20delayed%20project%20timeline%2C%20professional%20mentoring%20system%20interface%2C%20modern%20B2B%20SaaS%20design%20with%20orange%20accent%20color%2C%20clean%20minimalist%20style&width=600&height=400&seq=feature-ai-nudge-003&orientation=landscape',
    },
    {
      badge: 'Research Pay',
      title: '논문·특허 기여도 기반 인건비 산정',
      description:
        '저자 순서, IF, 특허 지분을 넣으면 이번 달 인건비가 1원 단위까지 투명하게 계산됩니다.',
      Icon: CircleDollarSign,
      stats: { value: '1원', label: '단위 정확도' },
      image:
        'https://readdy.ai/api/search-image?query=Transparent%20salary%20calculation%20dashboard%20showing%20research%20contribution%20metrics%20with%20author%20order%2C%20impact%20factor%2C%20and%20patent%20share%20inputs%2C%20precise%20monetary%20breakdown%20to%20single%20digit%2C%20professional%20academic%20payment%20system%2C%20clean%20data%20visualization%20with%20charts%2C%20modern%20B2B%20interface%20design&width=600&height=400&seq=feature-payment-003&orientation=landscape',
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 bg-light-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Features Grid */}
        <div className="space-y-14 sm:space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div
                className={`space-y-4 sm:space-y-6 ${
                  index % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/10 rounded-full">
                  <span className="text-primary text-xs sm:text-sm font-bold">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Stats Box */}
                <div className="inline-flex items-center space-x-3 sm:space-x-4 bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary/10 rounded-lg flex-shrink-0">
                    <feature.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-gray-900">
                      {feature.stats.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {feature.stats.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Authority Section */}
        <div className="mt-20 sm:mt-32 bg-gradient-to-br from-deep-navy to-deep-navy-light rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/20 rounded-full mx-auto">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              공대생의 고통은<br />공대생이 가장 잘 압니다
            </h2>

            <p className="text-white/80 text-sm sm:text-lg leading-relaxed">
              저희도 기계공학을 전공하며 수많은 밤을 행정 서류와 씨름했습니다.
              Lab-OS는 개발자가 아닌,{' '}
              <strong className="text-primary">
                연구실 행정의 비효율을 겪어본 기계공학 PM과 교수님이 직접 설계
              </strong>
              했습니다.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-4xl font-mono font-bold text-primary">
                  120+
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  도입 연구실
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-4xl font-mono font-bold text-primary">
                  15,000+
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  처리된 영수증
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-4xl font-mono font-bold text-primary">
                  240시간
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  월 평균 절약 시간
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
