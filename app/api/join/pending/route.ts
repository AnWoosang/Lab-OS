import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(
    new URL('/pending', process.env.NEXT_PUBLIC_APP_URL!)
  )
  response.cookies.set('lab_role', 'pending', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
