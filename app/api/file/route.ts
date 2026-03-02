import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrl } from '@/lib/supabase'
import { createSSRClient } from '@/lib/supabase-ssr'

export async function GET(request: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  try {
    const signedUrl = await getSignedUrl(path, 900)
    return NextResponse.redirect(signedUrl)
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
