'use client'

import { useState } from 'react'
import { BUDGET_CATEGORIES } from '@/lib/budget-categories'

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function CategorySelect({ value, onChange, placeholder = '카테고리 선택' }: Props) {
  const [isCustomMode, setIsCustomMode] = useState(() => {
    return value !== '' && !BUDGET_CATEGORIES.includes(value as never)
  })

  const selectValue = isCustomMode ? '__custom__' : value

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__custom__') {
      setIsCustomMode(true)
      onChange('')
    } else {
      setIsCustomMode(false)
      onChange(e.target.value)
    }
  }

  return (
    <div className="flex gap-1.5">
      <select
        value={selectValue}
        onChange={handleSelectChange}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
      >
        <option value="">{placeholder}</option>
        {BUDGET_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value="__custom__">직접 입력...</option>
      </select>
      {isCustomMode && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="직접 입력"
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-primary/50"
        />
      )}
    </div>
  )
}
