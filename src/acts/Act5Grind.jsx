import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sampleGradientStops } from '@/lib/colorLerp'
import useSectionView from '@/lib/useSectionView'

gsap.registerPlugin(ScrollTrigger)

const SKY_STOPS = [
  { p: 0, color: '#000004' },
  { p: 0.15, color: '#0B1440' },
  { p: 0.32, color: '#FF7A45' },
  { p: 0.5, color: '#EDEAE3' },
  { p: 0.68, color: '#B85C2E' },
  { p: 0.85, color: '#05040F' },
  { p: 1, color: '#000000' },
]

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

const WHEEL_R = 90
const CIRCUMFERENCE = 2 * Math.PI * WHEEL_R

function markerPoint(i) {
  const angle = (i / TIMELINE.length) * Math.PI * 2 - Math.PI / 2
  return { x: 100 + WHEEL_R * Math.cos(angle), y: 100 + WHEEL_R * Math.sin(angle) }
}

/**
 * The wheel IS the section now — no competing card list. It's pinned via
 * CSS `position: sticky` while the section itself provides ~2.4 screens of
 * scroll room, so each of the 8 hours gets real dwell time as the arc
 * fills and the active line changes underneath it, instead of the whole
 * cycle resolving in one instant scroll-past.
 *
 * IMPORTANT for verification: a single full-page/one-shot screenshot tool
 * renders the entire tall DOM at once without simulating scroll, so a
 * sticky-pinned element will always appear "stuck" near the top of its
 * container with the rest of the scroll room showing as empty space in
 * that kind of capture — that's a limitation of the capture method, not a
 * bug in the page (the same is true of any scroll-pinned section on any
 * site, e.g. Apple product pages). To verify this actually works, scroll
 * through it live, or take screenshots at several scroll increments
 * instead of one full-page shot.
 */
function GrindWheel({ arcRef }) {
  return (
    <div className="relative aspect-square w-[64vmin] max-w-[420px]">
      <motion.div
        aria-hidden
        className="absolute -inset-4 rounded-full"
        style={{ border: '1px dashed rgba(255,107,53,0.25)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={WHEEL_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle
          ref={arcRef}
          cx="100"
          cy="100"
          r={WHEEL_R}
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" id="grind-wheel-markers">
        {TIMELINE.map((entry, i) => {
          const { x, y } = markerPoint(i)
          return <circle key={entry.time} data-marker={i} cx={x} cy={y} r={3} fill="rgba(255,255,255,0.25)" />
        })}
      </svg>
    </div>
  )
}

export default function Act5Grind() {
  const sectionRef = useRef()
  const skyRef = useRef()
  const arcRef = useRef()
  const lastIndexRef = useRef(-1)
  const [activeIndex, setActiveIndex] = useState(0)

  useSectionView('grind')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
            onUpdate: (self) => {
              if (skyRef.current) {
                skyRef.current.style.backgroundColor = sampleGradientStops(SKY_STOPS, self.progress)
              }
              if (arcRef.current) {
                arcRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - self.progress))
              }
              const nextIndex = Math.min(
                TIMELINE.length - 1,
                Math.floor(self.progress * TIMELINE.length)
              )
              if (nextIndex !== lastIndexRef.current) {
                lastIndexRef.current = nextIndex
                setActiveIndex(nextIndex)
                document.querySelectorAll('#grind-wheel-markers [data-marker]').forEach((el) => {
                  const lit = Number(el.getAttribute('data-marker')) <= nextIndex
                  el.setAttribute('r', lit ? '4.5' : '3')
                  el.setAttribute('fill', lit ? 'var(--color-ember)' : 'rgba(255,255,255,0.25)')
                })
              }
            },
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const active = TIMELINE[activeIndex]

  return (
    <section id="grind" ref={sectionRef} className="relative w-full overflow-hidden isolate" style={{ height: '240vh' }}>
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        <div ref={skyRef} className="absolute inset-0 -z-10 transition-none" style={{ backgroundColor: '#000004' }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-black/10 to-black/60" />

        <h2 className="mb-2 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
          The Grind
        </h2>
        <p className="mb-10 max-w-md text-center font-body text-sm text-offwhite/50">
          Every day starts the same. What he does with it is what changed everything.
        </p>

        <GrindWheel arcRef={arcRef} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 max-w-lg text-center"
          >
            <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-ember">
              {active.time}
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-offwhite sm:text-3xl">
              {active.quote}
            </p>
            <p className="mt-2 font-body text-sm text-offwhite/60">{active.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
