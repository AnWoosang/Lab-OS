'use client'

import { useRouter } from 'next/navigation'
import { StatusDot } from '../components/StatusBadge'
import type { ProjectRow } from '@/lib/db'

export default function RiskAlerts({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter()
  const alerts = projects.filter((p) => p.status === 'red_zone' || p.status === 'warning')
  if (alerts.length === 0) return null

  return (
    <div className="bg-deep-navy-light rounded-xl border border-white/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold">⚠ 주의 필요 프로젝트</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium w-10 whitespace-nowrap">상태</th>
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium w-36 whitespace-nowrap">프로젝트 코드</th>
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium whitespace-nowrap">프로젝트명</th>
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium w-28 whitespace-nowrap">담당자</th>
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium w-16 whitespace-nowrap">위험도</th>
              <th className="text-left px-5 py-2 text-white/40 text-xs font-medium whitespace-nowrap">병목</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((project) => (
              <tr
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3">
                  <StatusDot status={project.status} />
                </td>
                <td className="px-5 py-3">
                  <span className="text-white/80 font-mono text-sm whitespace-nowrap">{project.projectCode}</span>
                </td>
                <td className="px-5 py-3 text-white/50 text-sm">
                  {project.projectName ?? '—'}
                </td>
                <td className="px-5 py-3 text-white/60 text-sm">
                  {project.leadStudent ?? '—'}
                </td>
                <td className="px-5 py-3 text-white/60 text-sm">
                  {project.riskScore ?? '—'}
                </td>
                <td className="px-5 py-3 max-w-[200px]">
                  <p className="text-white/40 text-xs line-clamp-2">{project.bottleneck ?? '—'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
