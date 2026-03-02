'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FlaskConical,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import {
  professorOnboardAction,
  studentOnboardAction,
  type OnboardingState,
} from './actions'

const initialState: OnboardingState = { ok: null, error: null }

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'professor' | 'student' | null>(null)
  const [copied, setCopied] = useState(false)

  const [profState, profAction, isProfPending] = useActionState(
    professorOnboardAction,
    initialState
  )
  const [stuState, stuAction, isStuPending] = useActionState(
    studentOnboardAction,
    initialState
  )

  // Redirect after success
  useEffect(() => {
    if (stuState.ok && stuState.role === 'student') {
      router.push('/upload')
    }
  }, [stuState, router])

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || ''

  const inviteLink = profState.joinCode ? `${appUrl}/join/${profState.joinCode}` : ''

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Professor success: show invite link ────────────────────────────────────
  if (profState.ok && profState.joinCode) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
        <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">연구실 생성 완료!</h1>
          <p className="text-white/50 text-sm mb-6">
            학생들에게 아래 초대 링크를 공유하세요.
          </p>
          <div className="bg-deep-navy rounded-xl border border-white/10 p-4 mb-6 text-left">
            <p className="text-white/40 text-xs mb-2">초대 링크</p>
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-mono break-all flex-1">
                {inviteLink}
              </span>
              <button
                onClick={() => handleCopy(inviteLink)}
                className="flex-shrink-0 text-white/40 hover:text-white/70 transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <a
            href="/dashboard"
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            대시보드로 이동
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  // ── Role selection ──────────────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
        <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Lab-OS 시작하기</h1>
              <p className="text-white/40 text-sm">역할을 선택해주세요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('professor')}
              className="bg-deep-navy border border-white/10 rounded-xl p-6 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white font-semibold mb-1">교수님</p>
              <p className="text-white/40 text-xs leading-relaxed">
                연구실을 생성하고 학생 보고서를 관리합니다
              </p>
            </button>

            <button
              onClick={() => setSelectedRole('student')}
              className="bg-deep-navy border border-white/10 rounded-xl p-6 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500/20">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-white font-semibold mb-1">학생</p>
              <p className="text-white/40 text-xs leading-relaxed">
                교수님께 받은 초대 링크나 코드로 연구실에 참여합니다
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Professor form ──────────────────────────────────────────────────────────
  if (selectedRole === 'professor') {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
        <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full">
          <button
            onClick={() => setSelectedRole(null)}
            className="text-white/40 hover:text-white/60 text-sm mb-6 transition-colors"
          >
            ← 뒤로
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">연구실 생성</h1>
              <p className="text-white/40 text-sm">교수님 계정으로 시작합니다</p>
            </div>
          </div>

          <form action={profAction} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">연구실명</label>
              <input
                type="text"
                name="labName"
                placeholder="예: 김철수 연구실"
                className="w-full bg-deep-navy border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            {profState.error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {profState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isProfPending}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProfPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>연구실 생성</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Student form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
      <div className="bg-deep-navy-light rounded-2xl border border-white/10 p-10 max-w-md w-full">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-white/40 hover:text-white/60 text-sm mb-6 transition-colors"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">연구실 참여</h1>
            <p className="text-white/40 text-sm">교수님께 받은 코드를 입력하세요</p>
          </div>
        </div>

        <form action={stuAction} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1.5">참여 코드</label>
            <input
              type="text"
              name="joinCode"
              placeholder="예: ABC123"
              maxLength={6}
              className="w-full bg-deep-navy border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
          </div>

          {stuState.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {stuState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isStuPending}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStuPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>참여 중...</span>
              </>
            ) : (
              <>
                <span>참여하기</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
