/**
 * Converts a period string to { from, to } ISO date strings for DB filtering.
 * Returns undefined if no filter should be applied.
 */
export function periodToDateRange(
  period: string | undefined
): { from: string; to: string } | undefined {
  if (!period || period === 'all') return undefined

  const now = new Date()
  const to = now.toISOString()

  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    return { from, to }
  }

  if (period === 'quarter') {
    const from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString()
    return { from, to }
  }

  if (period === 'half') {
    const from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString()
    return { from, to }
  }

  return undefined
}
