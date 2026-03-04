'use client'

import { useEffect } from 'react'

export default function NavDebugger() {
  useEffect(() => {
    // Intercept soft navigations (Next.js router / history API)
    const origPushState = history.pushState.bind(history)
    const origReplaceState = history.replaceState.bind(history)

    history.pushState = function (...args: Parameters<typeof origPushState>) {
      console.trace('[NavDebug] history.pushState → ', args[2])
      return origPushState(...args)
    }

    history.replaceState = function (...args: Parameters<typeof origReplaceState>) {
      console.trace('[NavDebug] history.replaceState → ', args[2])
      return origReplaceState(...args)
    }

    // Intercept full page navigations (hard reload / window.location)
    window.addEventListener('beforeunload', function () {
      // Use Error stack to capture callsite
      const stack = new Error('hard navigation triggered').stack
      console.error('[NavDebug] ⚠️ Hard navigation (full page reload)!', stack)
    })

    // Navigation API (Chrome 102+)
    if ('navigation' in window) {
      ;(window as any).navigation.addEventListener('navigate', (e: any) => {
        console.trace('[NavDebug] Navigation API → ', e.destination.url, 'type:', e.navigationType)
      })
    }

    console.log('[NavDebug] Interceptors installed on', window.location.href)
  }, [])

  return null
}
