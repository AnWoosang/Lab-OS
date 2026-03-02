'use client'

import { useRouter } from 'next/navigation'

interface Project {
  id: string
  projectCode: string
  projectName: string | null
}

interface Props {
  projects: Project[]
  selectedId: string | null
  basePath: string
}

export default function ProjectFilterTabs({ projects, selectedId, basePath }: Props) {
  const router = useRouter()

  return (
    <div className="mt-4">
      <select
        value={selectedId ?? ''}
        onChange={(e) => {
          const val = e.target.value
          router.push(val ? `${basePath}?project=${val}` : basePath)
        }}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-primary/50 cursor-pointer"
      >
        <option value="">전체 프로젝트</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.projectCode}{p.projectName ? ` · ${p.projectName}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
