import type { User } from '@supabase/supabase-js'
import { createSSRClient } from './supabase-ssr'
import { getUserProfile, type UserProfile } from './supabase'

export async function getCurrentUserWithProfile(): Promise<{
  authUser: User | null
  profile: UserProfile | null
}> {
  try {
    const supabase = await createSSRClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return { authUser: null, profile: null }

    const profile = await getUserProfile(user.id)
    return { authUser: user, profile }
  } catch {
    return { authUser: null, profile: null }
  }
}
