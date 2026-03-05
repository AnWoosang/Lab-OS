import { describe, it, expect } from 'vitest'

function formatAmount(val: string) {
  const digits = val.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString() : ''
}

describe('formatAmount', () => {
  it('숫자 입력 시 콤마 포맷 적용', () => {
    expect(formatAmount('1000000')).toBe('1,000,000')
  })
  it('빈 문자열 입력 시 빈 문자열 반환', () => {
    expect(formatAmount('')).toBe('')
  })
  it('이미 콤마가 있는 값 재포맷', () => {
    expect(formatAmount('1,000,000')).toBe('1,000,000')
  })
  it('비숫자 문자 제거', () => {
    expect(formatAmount('abc123')).toBe('123')
  })
})
