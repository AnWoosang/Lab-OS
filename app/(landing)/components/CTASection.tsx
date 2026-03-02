import { FlaskConical, Microscope, ArrowRight, ShieldCheck, Clock, CircleDollarSign } from 'lucide-react'

interface AuthProfile {
  role: 'professor' | 'student'
}

interface Props {
  profile?: AuthProfile | null
}

export default function CTASection({ profile }: Props) {
  const myLabHref = profile?.role === 'professor' ? '/dashboard' : '/upload'

  return (
    <section
      id="cta"
      className="py-16 sm:py-24 bg-gradient-to-br from-deep-navy via-deep-navy-light to-deep-navy relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#FF6B35 1px, transparent 1px), linear-gradient(90deg, #FF6B35 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="space-y-5 sm:space-y-8">
          {/* Icon */}
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center bg-primary/20 rounded-xl sm:rounded-2xl mx-auto">
            <FlaskConical className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
            아직도 엑셀로<br />
            관리하십니까?
          </h2>

          <p className="text-white/80 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            석박사 인재들의 시간을 행정 업무에 낭비하지 마세요.
            <br className="hidden sm:block" />
            Lab-OS가 연구실의 모든 행정을 자동화합니다.
          </p>

          {/* CTA Button */}
          <div className="pt-4 sm:pt-6">
            {profile ? (
              <a
                href={myLabHref}
                className="px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform inline-flex items-center justify-center space-x-2 sm:space-x-3 cursor-pointer whitespace-nowrap shadow-2xl shadow-primary/40 mx-auto text-base sm:text-xl"
              >
                <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>내 연구실 바로가기</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            ) : (
              <a
                href="/login"
                className="px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-full hover:scale-105 transition-transform inline-flex items-center justify-center space-x-2 sm:space-x-3 cursor-pointer whitespace-nowrap shadow-2xl shadow-primary/40 mx-auto text-base sm:text-xl"
              >
                <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>무료로 우리 랩 진단받기</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            )}
          </div>

          {/* Trust Elements */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 pt-4 sm:pt-8">
            <div className="flex items-center space-x-2 text-white/70">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm">국가 R&D 규정 준수</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm">5분 만에 진단 완료</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <CircleDollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm">무료 체험 제공</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
