/**
 * Centralized route permission rules.
 * Add new professor-only routes here — middleware picks them up automatically.
 */
export const PROFESSOR_ONLY_ROUTES = [
  '/dashboard',
  '/projects',
  '/reports',
  '/expenses',
  '/lab',
]
