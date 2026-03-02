import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/lib/auth'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const { authUser, profile } = await getCurrentUserWithProfile()

  if (!authUser) redirect('/login')

  // Already has a profile — redirect to the appropriate page
  if (profile) {
    if (profile.role === 'professor') redirect('/dashboard')
    if (profile.status === 'pending') redirect('/pending')
    redirect('/upload')
  }

  return <OnboardingClient />
}
