import { getWorkspaceContext } from '@/lib/workspace-context'
import { getAllProjects, getProjectsByUserId, getUploadSessionsForUser } from '@/lib/db'
import UploadClient from './components/UploadClient'

export default async function UploadPage() {
  const { user, workspaceId } = await getWorkspaceContext()

  const [projects, myProjects, sessions] = await Promise.all([
    getAllProjects(workspaceId),
    getProjectsByUserId(user.id, workspaceId),
    getUploadSessionsForUser(user.id, workspaceId),
  ])

  return (
    <UploadClient
      workspaceId={workspaceId}
      projects={projects}
      myProjects={myProjects}
      initialSessions={sessions}
    />
  )
}
