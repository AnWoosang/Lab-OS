interface Props {
  state: { ok?: boolean; error?: string } | null
  successMessage?: string
}

export function FormMessage({ state, successMessage = '✓ 저장됨' }: Props) {
  if (!state) return null
  if (state.ok) return <span className="text-green-400 text-xs">{successMessage}</span>
  if (state.error) return <span className="text-red-400 text-xs">{state.error}</span>
  return null
}
