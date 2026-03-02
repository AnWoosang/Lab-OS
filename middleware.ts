import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PROFESSOR_ONLY_ROUTES } from './lib/permissions'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths — no auth required
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/join/') ||
    pathname.startsWith('/guide') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Build a response we can mutate (for cookie refresh)
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate session (re-refreshes token if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Authenticated: check role cookie ──────────────────────────────────────
  const role = request.cookies.get('lab_role')?.value

  // No role cookie → let /api/refresh-role and /onboarding through; send everything else to /api/refresh-role
  // (refresh-role reads DB, sets cookie, and redirects to the right page — avoids /onboarding↔/pending loop)
  if (!role) {
    if (pathname !== '/onboarding' && pathname !== '/api/refresh-role') {
      return NextResponse.redirect(new URL('/api/refresh-role', request.url))
    }
    return NextResponse.next()
  }

  // Pending students can only access /pending and /api/refresh-role
  if (role === 'pending') {
    if (!pathname.startsWith('/pending') && pathname !== '/api/refresh-role') {
      return NextResponse.redirect(new URL('/pending', request.url))
    }
    return NextResponse.next()
  }

  // Students can't access professor-only routes
  if (
    role === 'student' &&
    PROFESSOR_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.redirect(new URL('/upload', request.url))
  }

  // Users with an existing role can't access /onboarding
  if (pathname.startsWith('/onboarding')) {
    if (role === 'student') return NextResponse.redirect(new URL('/upload', request.url))
    if (role === 'pending') return NextResponse.redirect(new URL('/pending', request.url))
    if (role === 'professor') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
