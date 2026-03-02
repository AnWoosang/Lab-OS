'use client'

import { useState, useEffect } from 'react'
import { FlaskConical, Menu, X } from 'lucide-react'

interface AuthProfile {
  role: 'professor' | 'student'
}

interface Props {
  profile?: AuthProfile | null
}

export default function Navbar({ profile }: Props) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      console.warn(`Element with id "${id}" not found.`)
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { label: '문제점', id: 'problems', highlight: false },
    { label: '기능', id: 'features', highlight: false },
    { label: '요금제', id: 'pricing', highlight: false },
    { label: '연구비 결제', id: 'payment-guide', highlight: true },
  ]

  const myLabHref = profile?.role === 'professor' ? '/dashboard' : '/upload'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary rounded-lg">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span
              className={`text-xl sm:text-2xl font-bold ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              Lab-OS
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-medium hover:text-primary transition-colors cursor-pointer ${
                  item.highlight
                    ? 'font-bold text-primary'
                    : isScrolled
                    ? 'text-gray-700'
                    : 'text-white/90'
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="/guide"
              className={`font-medium hover:text-primary transition-colors ${
                isScrolled ? 'text-gray-700' : 'text-white/90'
              }`}
            >
              도움말
            </a>
            {profile ? (
              <a
                href={myLabHref}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform cursor-pointer whitespace-nowrap"
              >
                내 연구실
              </a>
            ) : (
              <a
                href="/login"
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:scale-105 transition-transform cursor-pointer whitespace-nowrap"
              >
                시작하기
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[52px] bg-white z-40 animate-fadeIn">
          <div className="flex flex-col p-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left py-3.5 px-4 rounded-xl font-medium text-lg transition-colors cursor-pointer ${
                  item.highlight
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="/guide"
              className="text-left py-3.5 px-4 rounded-xl font-medium text-lg text-gray-800 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              도움말
            </a>
            <div className="pt-4">
              {profile ? (
                <a
                  href={myLabHref}
                  className="w-full py-4 bg-primary text-white font-bold rounded-full cursor-pointer whitespace-nowrap text-lg flex items-center justify-center"
                >
                  내 연구실
                </a>
              ) : (
                <a
                  href="/login"
                  className="w-full py-4 bg-primary text-white font-bold rounded-full cursor-pointer whitespace-nowrap text-lg flex items-center justify-center"
                >
                  무료로 시작하기
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
