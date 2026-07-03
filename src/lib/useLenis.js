import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Smooth scroll for the main experience (Act 3 onward). Returns a ref
 * holding the Lenis instance so callers (e.g. Nav) can call scrollTo().
 */
export default function useLenis(enabled) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
