import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import CategorySelect from '@/app/(app)/components/CategorySelect'

describe('CategorySelect', () => {
  it('"직접 입력..." 선택 후 텍스트 입력 필드가 유지됨', async () => {
    const user = userEvent.setup()
    let val = ''
    render(
      <CategorySelect value={val} onChange={(v) => { val = v }} />
    )

    await user.selectOptions(screen.getByRole('combobox'), '__custom__')
    expect(screen.getByPlaceholderText('직접 입력')).toBeInTheDocument()
  })

  it('기존 커스텀 값 로드 시 커스텀 모드로 표시', () => {
    render(<CategorySelect value="기타특수비용" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('직접 입력')).toBeInTheDocument()
    expect(screen.getByDisplayValue('기타특수비용')).toBeInTheDocument()
  })
})
