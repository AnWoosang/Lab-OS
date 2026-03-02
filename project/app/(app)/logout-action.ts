'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createSSRClient } from '@/lib/supabase-ssr'

export async function logoutAction() {
  const supabase = await createSSRClient()
  await supabase.auth.signOut()

  // lab_role 쿠키 삭제
  const cookieStore = await cookies()
  cookieStore.delete('lab_role')

  console.log('[auth] User logged out')
  redirect('/login')
}
