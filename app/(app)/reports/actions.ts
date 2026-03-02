'use server'

import { getWorkspaceContext } from '@/lib/workspace-context'

export async function generateReportRowSummaryAction(report: {
  projectCode: string
  projectName: string | null
  content: string | null
  progress: number | null
  reportDate: string | null
}): Promise<string> {
  await getWorkspaceContext() // auth check

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `다음 연구 진도 보고서 1건을 한국어 1~2문장으로 핵심만 요약해줘.
- 과제코드: ${report.projectCode}
- 프로젝트명: ${report.projectName ?? '미정'}
- 제출일: ${report.reportDate ?? '미상'}
- 진도율: ${report.progress !== null ? `${report.progress}%` : '미상'}
- 내용: ${report.content ?? '없음'}

교수가 이 보고서에서 파악해야 할 핵심 사항을 간결하게 요약해. 설명만 반환해.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
