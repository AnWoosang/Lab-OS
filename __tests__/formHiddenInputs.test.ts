import { describe, it, expect } from 'vitest'

describe('budgetItemsForServer', () => {
  it('빈 category 항목은 필터링됨', () => {
    const budgetItems = [
      { category: '인건비', amount: '1,000,000' },
      { category: '', amount: '500,000' },
    ]
    const result = budgetItems
      .filter((b) => b.category.trim() && b.amount.trim())
      .map((b) => ({
        category: b.category.trim(),
        allocatedAmount: parseInt(b.amount.replace(/,/g, ''), 10) || 0,
      }))
    expect(result).toHaveLength(1)
    expect(result[0].allocatedAmount).toBe(1000000)
  })

  it('콤마 포맷된 금액 파싱', () => {
    const amount = '5,000,000'
    expect(parseInt(amount.replace(/,/g, ''), 10)).toBe(5000000)
  })

  it('빈 amount 항목은 필터링됨', () => {
    const budgetItems = [
      { category: '재료비', amount: '' },
      { category: '여비', amount: '200,000' },
    ]
    const result = budgetItems.filter((b) => b.category.trim() && b.amount.trim())
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('여비')
  })
})
