/**
 * Thin analytics abstraction. Fires events through whatever's actually
 * installed (Plausible's `window.plausible`, or GA's `window.gtag`) and
 * no-ops otherwise so instrumentation can ship before a provider is wired
 * up (PRD launch checklist: "Analytics installed (Plausible or GA)").
 */
export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined') return

  if (typeof window.plausible === 'function') {
    window.plausible(name, { props })
    return
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, props)
    return
  }
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, props)
  }
}
