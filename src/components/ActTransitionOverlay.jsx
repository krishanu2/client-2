import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTION_IDS = ['method', 'about', 'proof', 'grind', 'call']

/**
 * A persistent thin ember "progress thread" down the right edge of the
 * screen — a shared visual connective tissue across Acts, since each Act
 * is an independently lazy-loaded, per-section Suspense boundary and
 * can't use Framer Motion `layoutId` shared-element transitions (those
 * need both elements mounted simultaneously, which the code-split
 * architecture doesn't allow). Pure CSS/DOM, so it sits entirely outside
 * the "no second WebGL context" constraint. Strictly additive: reads the
 * DOM, doesn't touch any existing Act's internals or ScrollTriggers.
 */
export default function ActTransitionOverlay() {
  const fillRef = useRef(null)
  const markerRefs = useRef({})

  useLayoutEffect(() => {
    // Section elements are lazy-loaded; give them a couple of frames to
    // mount before wiring ScrollTrigger against them.
    let raf1, raf2
    let ctx

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const main = document.querySelector('main')
        if (!main) return

        ctx = gsap.context(() => {
          gsap.to(fillRef.current, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: main,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.3,
            },
          })

          SECTION_IDS.forEach((id) => {
            const el = document.getElementById(id)
            const marker = markerRefs.current[id]
            if (!el || !marker) return

            ScrollTrigger.create({
              trigger: el,
              start: 'top 60%',
              end: 'bottom 40%',
              onEnter: () => gsap.to(marker, { opacity: 1, scale: 1.6, duration: 0.4, ease: 'power2.out' }),
              onLeave: () => gsap.to(marker, { opacity: 0.4, scale: 1, duration: 0.5 }),
              onEnterBack: () => gsap.to(marker, { opacity: 1, scale: 1.6, duration: 0.4, ease: 'power2.out' }),
              onLeaveBack: () => gsap.to(marker, { opacity: 0.4, scale: 1, duration: 0.5 }),
            })
          })
        })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      ctx?.revert()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed right-1.5 top-0 z-40 hidden h-screen w-[3px] sm:block">
      <div className="absolute inset-0 rounded-full bg-white/5" />
      <div
        ref={fillRef}
        className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-gradient-to-b from-ember/80 to-violet/60"
        style={{ transform: 'scaleY(0)' }}
      />
      {SECTION_IDS.map((id, i) => (
        <div
          key={id}
          ref={(el) => (markerRefs.current[id] = el)}
          className="absolute -left-[3px] h-2 w-2 rounded-full bg-ember opacity-40"
          style={{ top: `${(i / (SECTION_IDS.length - 1)) * 96}%` }}
        />
      ))}
    </div>
  )
}
