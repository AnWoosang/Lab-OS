'use client'

import { FlaskConical, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: '기능 소개', href: '#features' },
      { name: '요금제', href: '#pricing' },
      { name: '연구비 결제', href: '#payment-guide' },
      { name: '고객 사례', href: '#testimonial' }
    ],
    support: [
      { name: '도움말 센터', href: '#' },
      { name: '도입 가이드', href: '#' },
      { name: 'API 문서', href: '#' },
      { name: '문의하기', href: '#' }
    ],
    company: [
      { name: '팀 소개', href: '#' },
      { name: '채용', href: '#' },
      { name: '블로그', href: '#' },
      { name: '파트너십', href: '#' }
    ]
  }

  /**
   * Smoothly scrolls to a page section identified by an anchor id.
   * Ignores invalid ids.
   */
  const scrollToSection = (id: string) => {
    if (!id || typeof id !== 'string') return

    if (id.startsWith('#')) {
      const element = document.getElementById(id.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-gray-50 pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Lab-OS</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              대학 연구실 전용<br />
              AI 행정 자동화 플랫폼
            </p>
          </div>

          {/* Product Links */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">제품</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-600 hover:text-primary text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">지원</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-600 hover:text-primary text-xs sm:text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">회사</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-600 hover:text-primary text-xs sm:text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
            <span>© 2025 Lab-OS. All rights reserved.</span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <a href="#" className="hover:text-primary transition-colors">이용약관</a>
            <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <a
              href="#"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer text-sm sm:text-base"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer text-sm sm:text-base"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
