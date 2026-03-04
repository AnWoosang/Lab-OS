// Server-side error logger. Replace console.error with Sentry/etc. here when ready.
export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error instanceof Error ? error.message : error)
}
