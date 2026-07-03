import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

/**
 * Fires a `section_viewed` analytics event the first time the given
 * section scrolls to 50% visibility — lets Karnjeet see where in the
 * experience visitors actually get to (Act drop-off). Also accumulates
 * dwell time (handles scrolling back into a section more than once) and
 * reports `section_dwell` whenever the section leaves view or the page
 * is hidden/closed, so later phases have real data instead of guesses
 * (e.g. Phase 3's "do people open 1 vs 3 Method panels" question).
 */
export default function useSectionView(sectionId) {
  const firedRef = useRef(false)
  const enteredAtRef = useRef(null)
  const totalDwellMsRef = useRef(0)

  useEffect(() => {
    const el = document.getElementById(sectionId)
    if (!el) return undefined

    const reportDwell = () => {
      if (enteredAtRef.current === null) return
      totalDwellMsRef.current += performance.now() - enteredAtRef.current
      enteredAtRef.current = null
      trackEvent('section_dwell', {
        section: sectionId,
        seconds: Math.round(totalDwellMsRef.current / 100) / 10,
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!firedRef.current) {
            firedRef.current = true
            trackEvent('section_viewed', { section: sectionId })
          }
          enteredAtRef.current = performance.now()
        } else {
          reportDwell()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)

    const handleHide = () => {
      if (document.visibilityState === 'hidden') reportDwell()
    }
    document.addEventListener('visibilitychange', handleHide)
    window.addEventListener('pagehide', reportDwell)

    return () => {
      reportDwell()
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleHide)
      window.removeEventListener('pagehide', reportDwell)
    }
  }, [sectionId])
}
