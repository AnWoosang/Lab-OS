'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BarChart2,
  BarChartHorizontal,
  LineChart,
  Lightbulb,
  Clock,
  CircleDollarSign,
  FileCheck,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'

interface BarProps {
  label: string
  before: number
  after: number
  unit: string
  isVisible: boolean
  delay: number
  improvement: string
}

/**
 * AnimatedBar – displays a before / after bar with a smooth animation.
 * Added safety checks for timers to avoid memory-leaks if the component
 * unmounts before the animation finishes.
 */
function AnimatedBar({
  label,
  before,
  after,
  unit,
  isVisible,
  delay,
  improvement,
}: BarProps) {
  const [animatedBefore, setAnimatedBefore] = useState(0)
  const [animatedAfter, setAnimatedAfter] = useState(0)
  const maxVal = Math.max(before, after)

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      const duration = 1200
      const steps = 40
      const stepTime = duration / steps
      let step = 0

      const interval = setInterval(() => {
        step += 1
        const progress = step / steps
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimatedBefore(Math.round(before * eased))
        setAnimatedAfter(Math.round(after * eased))

        if (step >= steps) clearInterval(interval)
      }, stepTime)

      // Cleanup for the interval when the effect is torn down
      return () => clearInterval(interval)
    }, delay)

    // Cleanup for the timeout
    return () => clearTimeout(timer)
  }, [isVisible, before, after, delay])

  const beforeWidth = maxVal > 0 ? (animatedBefore / maxVal) * 100 : 0
  const afterWidth = maxVal > 0 ? (animatedAfter / maxVal) * 100 : 0

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-gray-800 font-bold text-xs sm:text-sm">{label}</span>
        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-50 text-green-700 text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
          {improvement}
        </span>
      </div>

      {/* Before Bar */}
      <div className="space-y-1 sm:space-y-1.5">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-[10px] sm:text-xs text-gray-400 w-10 sm:w-14 flex-shrink-0">
            도입 전
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 sm:h-7 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-end pr-2 sm:pr-3 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(beforeWidth, 12)}%` }}
            >
              <span className="text-white text-[10px] sm:text-xs font-mono font-bold">
                {animatedBefore}
                {unit}
              </span>
            </div>
          </div>
        </div>

        {/* After Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-[10px] sm:text-xs text-primary font-semibold w-10 sm:w-14 flex-shrink-0">
            도입 후
          </span>
          <div className="flex-1 bg-primary/5 rounded-full h-5 sm:h-7 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-end pr-2 sm:pr-3 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(afterWidth, 12)}%` }}
            >
              <span className="text-white text-[10px] sm:text-xs font-mono font-bold">
                {animatedAfter}
                {unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const chartData = [
  { label: '월간 행정 업무 시간', before: 120, after: 12, unit: '시간', improvement: '90% 감소' },
  { label: '영수증 처리 건당 소요 시간', before: 45, after: 3, unit: '분', improvement: '93% 단축' },
  { label: '서류 반려율', before: 35, after: 2, unit: '%', improvement: '94% 개선' },
  { label: '과제 종료 후 정산 기간', before: 30, after: 3, unit: '일', improvement: '90% 단축' },
  { label: '보고서 작성 시간 (주간)', before: 8, after: 1, unit: '시간', improvement: '87% 절약' },
]

const timelineData = [
  { month: '도입 전', admin: 120, research: 40, label: '행정 120h / 연구 40h' },
  { month: '1개월', admin: 80, research: 80, label: '행정 80h / 연구 80h' },
  { month: '3개월', admin: 35, research: 125, label: '행정 35h / 연구 125h' },
  { month: '6개월', admin: 15, research: 145, label: '행정 15h / 연구 145h' },
  { month: '8개월 (현재)', admin: 12, research: 148, label: '행정 12h / 연구 148h' },
]

const summaryStats: { Icon: LucideIcon; value: string; label: string; sub: string }[] = [
  { Icon: Clock, value: '90%', label: '행정 시간 절감', sub: '120h → 12h/월' },
  { Icon: CircleDollarSign, value: '₩2,400만', label: '연간 인건비 절약', sub: '석박사 시급 환산' },
  { Icon: FileCheck, value: '98%', label: '서류 승인율', sub: '반려율 35% → 2%' },
  { Icon: FlaskConical, value: '3.7배', label: '연구 시간 증가', sub: '40h → 148h/월' },
]

export default function BeforeAfterSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  const maxTime = 160

  return (
    <section
      id="before-after"
      ref={sectionRef}
      className="py-16 sm:py-28 bg-white relative overflow-hidden"
    >
      {/* Subtle Background */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-deep-navy/3 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-green-50 rounded-full border border-green-200">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-green-700 text-xs sm:text-sm font-bold">
              실제 데이터 기반
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            50명 이상 연구실의
            <br />
            <span className="text-primary">실제 Before / After</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-lg max-w-2xl mx-auto">
            KAIST 기계공학과 글로벌 협력 연구실 · 도입 8개월 차 실측 데이터
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-16">
          {/* Left: Bar Charts */}
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-5 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <BarChartHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  핵심 지표 비교
                </h3>
                <p className="text-gray-500 text-[10px] sm:text-xs">
                  도입 전 vs 도입 8개월 후
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-7">
              {chartData.map((item, index) => (
                <AnimatedBar
                  key={index}
                  label={item.label}
                  before={item.before}
                  after={item.after}
                  unit={item.unit}
                  isVisible={isVisible}
                  delay={index * 200}
                  improvement={item.improvement}
                />
              ))}
            </div>
          </div>

          {/* Right: Timeline Stacked Chart */}
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-5 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  시간 배분 변화 추이
                </h3>
                <p className="text-gray-500 text-[10px] sm:text-xs">
                  행정 업무 vs 연구 활동 (월간 시간)
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 sm:space-x-6 mb-4 sm:mb-6">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-400"></div>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  행정 업무
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-primary"></div>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  연구 활동
                </span>
              </div>
            </div>

            {/* Stacked Bars */}
            <div className="space-y-3 sm:space-y-4">
              {timelineData.map((item, index) => {
                const adminWidth = (item.admin / maxTime) * 100
                const researchWidth = (item.research / maxTime) * 100
                const isLast = index === timelineData.length - 1

                // Build a safe className string without using template literals that contain slashes
                const containerClasses = [
                  'space-y-1',
                  'sm:space-y-1.5',
                  isLast &&
                    'bg-primary/5 -mx-2 sm:-mx-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-primary/20',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div key={index} className={containerClasses}>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] sm:text-xs font-semibold ${
                          isLast ? 'text-primary' : 'text-gray-600'
                        }`}
                      >
                        {item.month}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex h-6 sm:h-8 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center transition-all duration-1000 ease-out"
                        style={{
                          width: isVisible ? `${adminWidth}%` : '0%',
                          transitionDelay: `${index * 200 + 400}ms`,
                        }}
                      >
                        {adminWidth > 12 && (
                          <span className="text-white text-[10px] sm:text-xs font-mono font-bold">
                            {item.admin}h
                          </span>
                        )}
                      </div>
                      <div
                        className="bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center transition-all duration-1000 ease-out"
                        style={{
                          width: isVisible ? `${researchWidth}%` : '0%',
                          transitionDelay: `${index * 200 + 600}ms`,
                        }}
                      >
                        {researchWidth > 12 && (
                          <span className="text-white text-[10px] sm:text-xs font-mono font-bold">
                            {item.research}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insight */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-green-50 rounded-lg flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 mb-0.5 sm:mb-1">
                    핵심 인사이트
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                    도입 8개월 후, 행정 업무 시간이{' '}
                    <strong className="text-primary">120시간 → 12시간</strong>으로 감소하고
                    연구 활동 시간이{' '}
                    <strong className="text-primary">40시간 → 148시간</strong>으로 3.7배
                    증가했습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-deep-navy to-deep-navy-light rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-primary/15 rounded-lg sm:rounded-xl mx-auto mb-2 sm:mb-4">
                <stat.Icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-xl sm:text-3xl font-mono font-bold text-primary mb-0.5 sm:mb-1">
                {stat.value}
              </div>
              <div className="text-white font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-1">
                {stat.label}
              </div>
              <div className="text-white/50 text-[10px] sm:text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
