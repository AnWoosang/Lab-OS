import { describe, it, expect } from 'vitest'

function validateProjectForm(fields: {
  project_code: string
  card_last4?: string
  start_date?: string
  end_date?: string
}) {
  const errors: Record<string, string> = {}
  const code = fields.project_code.trim()
  if (!code) errors.project_code = '과제코드를 입력해주세요.'
  else if (!/^[A-Za-z0-9\-_]+$/.test(code)) errors.project_code = '영문, 숫자, 하이픈(-)만 사용할 수 있습니다.'

  const card = (fields.card_last4 ?? '').trim()
  if (card && !/^\d{4}$/.test(card)) errors.card_last4 = '카드 번호는 숫자 4자리여야 합니다.'

  const start = fields.start_date ?? ''
  const end = fields.end_date ?? ''
  if (start && end && start > end) errors.end_date = '종료일은 시작일 이후여야 합니다.'
  return errors
}

describe('validateProjectForm', () => {
  it('빈 과제코드 → 에러', () => {
    expect(validateProjectForm({ project_code: '' }).project_code).toBeTruthy()
  })
  it('유효한 과제코드 → 에러 없음', () => {
    expect(validateProjectForm({ project_code: 'AI-2024-01' }).project_code).toBeUndefined()
  })
  it('특수문자 과제코드 → 에러', () => {
    expect(validateProjectForm({ project_code: 'AI 2024' }).project_code).toBeTruthy()
  })
  it('카드 3자리 → 에러', () => {
    expect(validateProjectForm({ project_code: 'X', card_last4: '123' }).card_last4).toBeTruthy()
  })
  it('카드 4자리 → 에러 없음', () => {
    expect(validateProjectForm({ project_code: 'X', card_last4: '1234' }).card_last4).toBeUndefined()
  })
  it('종료일이 시작일보다 빠름 → 에러', () => {
    expect(validateProjectForm({ project_code: 'X', start_date: '2024-12-01', end_date: '2024-01-01' }).end_date).toBeTruthy()
  })
  it('종료일 ≥ 시작일 → 에러 없음', () => {
    expect(validateProjectForm({ project_code: 'X', start_date: '2024-01-01', end_date: '2024-12-31' }).end_date).toBeUndefined()
  })
})
