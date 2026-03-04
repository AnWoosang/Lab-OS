import { NextResponse } from 'next/server'
import { getCurrentUserWithProfile } from '@/lib/auth'

export async function GET(request: Request) {
  const { authUser, profile } = await getCurrentUserWithProfile()

  if (!authUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!profile) {
    const response = NextResponse.redirect(new URL('/onboarding', request.url))
    response.cookies.delete('lab_role')
    return response
  }

  const dest =
    profile.role === 'professor'
      ? '/dashboard'
      : profile.status === 'pending'
      ? '/pending'
      : '/upload'

  const cookieRole =
    profile.role === 'professor'
      ? 'professor'
      : profile.status === 'pending'
      ? 'pending'
      : 'student'

  const response = NextResponse.redirect(new URL(dest, request.url))
  response.cookies.set('lab_role', cookieRole, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
