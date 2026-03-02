import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserProfile } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || ''

  if (!code) {
    console.error('[auth/callback] no code in URL')
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  // Accumulate cookies set during code exchange
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options as Record<string, unknown> })
          )
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message ?? 'no_session')}`, origin))
  }

  // Determine redirect destination
  const profile = await getUserProfile(session.user.id)

  let dest: string
  if (!profile) {
    // No profile yet — respect the `next` param (e.g. /join/ABC123) or go to onboarding
    dest = next || '/onboarding'
  } else {
    // Already has profile — respect `next` if it's a join link (re-joining same lab), else role-based
    if (next && next.startsWith('/join/')) {
      dest = next
    } else {
      dest = profile.role === 'professor' ? '/dashboard' : '/upload'
    }
  }

  const response = NextResponse.redirect(new URL(dest, origin))

  // Copy session cookies to the response
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  // Set role cookie if we have a profile
  if (profile) {
    response.cookies.set('lab_role', profile.role, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return response
}
