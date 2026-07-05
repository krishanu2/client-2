import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useSectionView from '@/lib/useSectionView'

gsap.registerPlugin(ScrollTrigger)

const TIMELINE = [
  { time: '3:00 AM', quote: 'While the world sleeps, I build.', detail: 'Workout begins. First set of the day.' },
  { time: '5:00 AM', quote: 'Food is information. Treat it that way.', detail: 'Meal prep. Macros logged.' },
  { time: '6:00 AM', quote: 'My clients come first. Every single morning.', detail: 'Client check-ins. DMs reviewed. Progress photos assessed.' },
  { time: '9:00 AM', quote: 'The work you do for yourself shows others what’s possible.', detail: 'His own training and mindset content creation.' },
  { time: '12:00 PM', quote: 'Rest is part of the plan. Never skip it.', detail: 'Recovery, lunch, walks.' },
  { time: '3:00 PM', quote: 'Coaching calls. Where the real shifts happen.', detail: '1-on-1 video calls with clients.' },
  { time: '6:00 PM', quote: 'The 90/90. Because honesty is the only currency that matters.', detail: 'His video talk series — raw, honest reflections.' },
  { time: '11:00 PM', quote: 'Day X of 365. Still here. Still becoming.', detail: 'End of day. Reflection. Tomorrow’s plan set.' },
]

// Each panel's own time-of-day tint — same idea as the old sky-gradient,
// but as a discrete per-panel color since panels snap by, not blend.
const PANEL_TINTS = [
  'radial-gradient(circle at 30% 30%, rgba(11,20,64,0.7), #000004 70%)',
  'radial-gradient(circle at 30% 30%, rgba(255,122,69,0.25), #050410 70%)',
  'radial-gradient(circle at 30% 30%, rgba(255,150,90,0.3), #0a0a14 70%)',
  'radial-gradient(circle at 30% 30%, rgba(237,234,227,0.18), #0a0a14 70%)',
  'radial-gradient(circle at 30% 30%, rgba(255,122,69,0.22), #0a0a14 70%)',
  'radial-gradient(circle at 30% 30%, rgba(184,92,46,0.28), #08060d 70%)',
  'radial-gradient(circle at 30% 30%, rgba(139,92,246,0.22), #050410 70%)',
  'radial-gradient(circle at 30% 30%, rgba(5,4,15,0.9), #000000 70%)',
]

/**
 * A horizontal filmstrip, not a vertical list or a wheel — reaching this
 * section keeps the scroll gesture going, but converts it into horizontal
 * motion through the 8 hours before releasing back to normal vertical
 * scroll into Call. Built on GSAP ScrollTrigger's own `pin` (not CSS
 * `position: sticky`) — sticky was found to desync from Lenis-managed
 * scroll state at certain scroll inputs (scrollbar drag, fast flicks),
 * leaving the section blank mid-scroll; ScrollTrigger's pin is the
 * mechanism this codebase already keeps in sync with Lenis
 * (`lenis.on('scroll', ScrollTrigger.update)` in App.jsx), so it doesn't
 * have that failure mode.
 */
export default function Act5Grind() {
  const sectionRef = useRef()
  const wrapperRef = useRef()
  const trackRef = useRef()
  const railFillRef = useRef()
  const panelRefs = useRef([])

  useSectionView('grind')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      // track itself is `w-fit` (sized to its own content, 8 panels wide),
      // so track.clientWidth already equals scrollWidth — the clipping
      // happens on the wrapper (overflow-hidden), so the wrapper's width
      // is what "one screen" of scroll distance actually means here.
      const distance = track.scrollWidth - wrapperRef.current.clientWidth

      const tween = gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + distance,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (railFillRef.current) {
              railFillRef.current.style.transform = `scaleX(${self.progress})`
            }
          },
        },
      })

      panelRefs.current.forEach((el) => {
        if (!el) return
        gsap.fromTo(
          el.querySelector('[data-panel-content]'),
          { opacity: 0.25, y: 16 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              containerAnimation: tween,
              start: 'left 65%',
              end: 'left 35%',
              scrub: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="grind" ref={sectionRef} className="isolate relative w-full overflow-hidden">
      <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
        <h2 className="mb-2 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
          The Grind
        </h2>
        <p className="mb-8 max-w-md px-6 text-center font-body text-sm text-offwhite/50">
          Every day starts the same. What he does with it is what changed everything.
        </p>

        <div ref={wrapperRef} className="relative h-[52vh] w-full overflow-hidden sm:h-[46vh]">
          <div ref={trackRef} className="flex h-full w-fit">
            {TIMELINE.map((entry, i) => (
              <div
                key={entry.time}
                ref={(el) => (panelRefs.current[i] = el)}
                className="relative flex h-full w-screen shrink-0 items-center justify-center px-6"
                style={{ background: PANEL_TINTS[i] }}
              >
                <div data-panel-content className="max-w-lg text-center">
                  <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-ember">
                    {entry.time}
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-offwhite sm:text-4xl">
                    {entry.quote}
                  </p>
                  <p className="mt-3 font-body text-sm text-offwhite/60">{entry.detail}</p>
                </div>
                <p
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[30vw] leading-none text-offwhite/[0.04]"
                >
                  {i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 px-6">
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-offwhite/30">3am</span>
          <div className="relative h-[2px] w-40 overflow-hidden rounded-full bg-white/10 sm:w-64">
            <div
              ref={railFillRef}
              className="absolute inset-y-0 left-0 w-full origin-left bg-ember"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
          <span className="font-heading text-[10px] uppercase tracking-[0.25em] text-offwhite/30">11pm</span>
        </div>
        <p className="mt-3 font-body text-[11px] uppercase tracking-[0.2em] text-offwhite/25">
          keep scrolling →
        </p>
      </div>
    </section>
  )
}
