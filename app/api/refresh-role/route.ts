import { NextResponse } from 'next/server'
import { getCurrentUserWithProfile } from '@/lib/auth'

export async function GET(request: Request) {
  const { authUser, profile } = await getCurrentUserWithProfile()

  if (!authUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const dest = !profile
    ? '/onboarding'
    : profile.role === 'professor'
    ? '/dashboard'
    : profile.status === 'pending'
    ? '/pending'
    : '/upload'

  const response = NextResponse.redirect(new URL(dest, request.url))

  if (profile) {
    const cookieRole =
      profile.role === 'professor'
        ? 'professor'
        : profile.status === 'pending'
        ? 'pending'
        : 'student'

    response.cookies.set('lab_role', cookieRole, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return response
}
