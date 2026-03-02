import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from './auth'

/**
 * Per-request cached workspace context.
 * Replaces per-page boilerplate: `const { profile } = await getCurrentUserWithProfile(); if (!profile?.workspaceId) redirect('/onboarding')`
 *
 * Usage:
 *   const { user, profile, workspaceId } = await getWorkspaceContext()
 */
export const getWorkspaceContext = cache(async () => {
  const { authUser, profile } = await getCurrentUserWithProfile()
  if (!authUser) redirect('/login')
  if (!profile?.workspaceId) redirect('/onboarding')
  return { user: authUser, profile, workspaceId: profile.workspaceId as string }
})
