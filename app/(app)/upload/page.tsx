import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/lib/auth'
import { getAllProjects, getProjectsByUserId, getUploadSessionsForUser } from '@/lib/db'
import UploadClient from './components/UploadClient'

export default async function UploadPage() {
  const { authUser, profile } = await getCurrentUserWithProfile()

  if (!authUser || !profile) redirect('/login')
  if (!profile.workspaceId) redirect('/onboarding')

  const [projects, myProjects, sessions] = await Promise.all([
    getAllProjects(profile.workspaceId),
    getProjectsByUserId(authUser.id, profile.workspaceId),
    getUploadSessionsForUser(authUser.id, profile.workspaceId),
  ])

  return (
    <UploadClient
      workspaceId={profile.workspaceId}
      projects={projects}
      myProjects={myProjects}
      initialSessions={sessions}
    />
  )
}
