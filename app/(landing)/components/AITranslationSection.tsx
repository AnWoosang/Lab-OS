'use client'

import { useState } from 'react'
import {
  Languages,
  MessageCircle,
  FileText,
  Receipt,
  Mail,
  Mic,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react'

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷', sample: '이번 달 센서 구매 영수증 정리 완료했습니다.' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', sample: 'Tôi đã hoàn thành việc sắp xếp hóa đơn mua cảm biến tháng này.' },
  { code: 'en', name: 'English', flag: '🇺🇸', sample: "I have completed organizing this month's sensor purchase receipts." },
  { code: 'zh', name: '中文', flag: '🇨🇳', sample: '本月传感器采购收据整理完毕。' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', sample: '今月のセンサー購入領収書の整理が完了しました。' },
]

const useCases: { Icon: LucideIcon; title: string; description: string; highlight: string }[] = [
  {
    Icon: MessageCircle,
    title: '실시간 대화 번역',
    description: '슬랙 메시지를 교수님 언어로 자동 번역. 베트남 연구원이 모국어로 보고해도 한국어로 즉시 확인.',
    highlight: '슬랙 연동',
  },
  {
    Icon: FileText,
    title: '보고서 자동 번역',
    description: '노션 보고서를 다국어로 동시 생성. 한국어 원본 + 영어 버전 자동 제공으로 국제 공동 연구 대응.',
    highlight: '노션 연동',
  },
  {
    Icon: Receipt,
    title: '영수증 다국어 OCR',
    description: '베트남어, 영어, 일본어 영수증도 AI가 인식. 해외 출장 정산이 언어 장벽 없이 자동 처리.',
    highlight: 'OCR 지원',
  },
  {
    Icon: Mail,
    title: 'AI 멘토링 메일 번역',
    description: '진도 독촉 메일을 연구원 모국어로 발송. 한국어를 못해도 정확한 피드백을 받을 수 있습니다.',
    highlight: '자동 발송',
  },
]

export default function AITranslationSection() {
  const [activeLang, setActiveLang] = useState(0)

  return (
    <section id="ai-translation" className="py-16 sm:py-28 bg-gradient-to-b from-deep-navy to-deep-navy-light relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-[120px] sm:text-[200px] font-bold text-white/5 select-none leading-none">AI</div>
        <div className="absolute bottom-20 right-10 text-[120px] sm:text-[200px] font-bold text-white/5 select-none leading-none">翻訳</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-primary/10 rounded-full border border-primary/20">
            <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-primary text-xs sm:text-sm font-bold">다국어 연구실 필수 기능</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            언어가 달라도,<br />
            <span className="text-primary">연구실은 하나로 통합됩니다</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-lg max-w-2xl mx-auto">
            베트남, 중국, 일본 등 다국적 연구원이 모국어로 소통하고
            교수님은 한국어로 모든 것을 관리하세요
          </p>
        </div>

        {/* Live Translation Demo */}
        <div className="max-w-4xl mx-auto mb-14 sm:mb-20">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden">
            {/* Demo Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                <span className="text-white/50 text-xs sm:text-sm ml-2 sm:ml-3 font-mono hidden sm:inline">
                  Lab-OS AI Translation Engine
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-mono">LIVE</span>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center space-x-1 px-4 sm:px-6 pt-4 sm:pt-5 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(index)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeLang === index
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  <span className="text-base sm:text-lg">{lang.flag}</span>
                  <span className="text-xs sm:text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Translation Display */}
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Input */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 text-white/40 text-xs">
                    <span>연구원 원문</span>
                    <span className="text-base sm:text-lg">{languages[activeLang].flag}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10 min-h-[60px] sm:min-h-[80px]">
                    <p className="text-white/90 text-sm sm:text-lg leading-relaxed">{languages[activeLang].sample}</p>
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 text-white/40 text-xs">
                    <span>교수님 화면</span>
                    <span className="text-base sm:text-lg">🇰🇷</span>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-mono">AI 번역</span>
                  </div>
                  <div className="bg-primary/5 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-primary/20 min-h-[60px] sm:min-h-[80px]">
                    <p className="text-white text-sm sm:text-lg leading-relaxed">{languages[0].sample}</p>
                  </div>
                </div>
              </div>

              {/* Arrow Animation */}
              <div className="flex justify-center my-3 sm:my-4">
                <div className="flex items-center space-x-3 text-white/30">
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-primary/50"></div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 rounded-full">
                    <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-primary/50"></div>
                </div>
              </div>

              {/* Supported Languages Count */}
              <div className="text-center">
                <span className="text-white/40 text-xs sm:text-sm">현재 지원 언어: </span>
                <span className="text-primary font-mono font-bold text-xs sm:text-sm">12개 언어</span>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-white/10 hover:border-primary/40 hover:bg-white/8 transition-all duration-300"
            >
              <div className="flex items-start space-x-4 sm:space-x-5">
                <div className="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-primary/15 rounded-lg sm:rounded-xl group-hover:bg-primary/25 transition-colors">
                  <useCase.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="text-base sm:text-xl font-bold text-white">{useCase.title}</h3>
                    <span className="px-2 sm:px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
                      {useCase.highlight}
                    </span>
                  </div>
                  <p className="text-white/60 leading-relaxed text-xs sm:text-base">{useCase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real Case Highlight */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-primary/20">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex items-start space-x-4 sm:space-x-5">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/20 rounded-xl sm:rounded-2xl flex-shrink-0">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm sm:text-lg mb-1">
                  실제 사례: 50명 이상 베트남 연구원 연구실
                </p>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                  &ldquo;베트남 연구원들이 모국어로 슬랙에 보고하면, 교수님 노션에는 한국어 보고서가 자동 생성됩니다.
                  언어 때문에 소통이 안 되던 문제가 완전히 사라졌습니다.&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 sm:space-x-8 pl-0 sm:pl-20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-primary">90%</div>
                <div className="text-white/50 text-[10px] sm:text-xs">소통 오류 감소</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-primary">5개</div>
                <div className="text-white/50 text-[10px] sm:text-xs">지원 언어 활용</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
