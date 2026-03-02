import { ArrowDown, FileX2, Presentation, ClipboardList } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

export default function ProblemSolutionSection() {
  const problems: {
    Icon: LucideIcon
    title: string
    description: string
    detail: string
    color: string
    borderColor: string
  }[] = [
    {
      Icon: FileX2,
      title: '영수증 분실의 악순환',
      description: '교수님, 저번에 산 센서 영수증 어디 갔어?',
      detail: '찾느라 실험 중단, 결국 사비 처리하거나 행정실 반려. 해외 출장이라도 다녀오면 비행기표, 호텔 영수증, 증빙 자료까지 산더미.',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30'
    },
    {
      Icon: Presentation,
      title: '보여주기식 보고서',
      description: '보고를 위한 보고서 작성',
      detail: '진짜 연구 데이터는 묻히고, 화려한 PPT 만드느라 밤새는 학생들. 알맹이 없는 형식적 보고의 반복.',
      color: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      Icon: ClipboardList,
      title: '행정 업무의 늪',
      description: '연구비 정산이 주업무?',
      detail: '석박사 인재들이 단순 영수증 처리에 하루 평균 2시간 낭비. 과제 종료 후 산학협력단 제출용 서류 정리만 한 달.',
      color: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30'
    }
  ]

  return (
    <section id="problems" className="py-16 sm:py-24 bg-gradient-to-b from-deep-navy to-deep-navy-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            우리 연구실, 혹시 이런 모습 아닙니까?
          </h2>
          <p className="text-white/60 text-sm sm:text-lg">
            전국 대학 연구실이 겪고 있는 3가지 고통
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-14 sm:mb-20">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${problem.color} backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-8 border-2 ${problem.borderColor} hover:scale-105 transition-transform duration-300`}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6 bg-white/10 rounded-lg sm:rounded-xl">
                <problem.Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Content */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{problem.title}</h3>
                <p className="text-white/90 font-semibold text-base sm:text-lg">&ldquo;{problem.description}&rdquo;</p>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">{problem.detail}</p>
              </div>

              {/* Number Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider with Icon */}
        <div className="flex items-center justify-center my-10 sm:my-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="mx-4 sm:mx-6 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        </div>

        {/* Solution Preview */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Lab-OS 도입 후,<br />
            <span className="text-primary">연구실의 일상은 이렇게 바뀝니다</span>
          </h2>
          <p className="text-white/70 text-sm sm:text-lg max-w-2xl mx-auto">
            기계공학 전공자가 직접 설계한, 연구실 행정의 비효율을 근본적으로 해결하는 시스템
          </p>
        </div>
      </div>
    </section>
  )
}
