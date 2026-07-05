import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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
 * A wheel, not a list — the same eight hours repeating, day after day, is
 * the whole point of "the grind." A vertical stack of cards reads as a
 * schedule; a wheel that fills in as you scroll reads as a cycle he's
 * already run hundreds of times. The progress arc is scroll-bound directly
 * (no React re-render per frame, same pattern as the sky-color tween
 * below); only the center readout re-renders, and only when the active
 * hour actually changes.
 */
function GrindWheel({ arcRef, activeIndex }) {
  const active = TIMELINE[activeIndex]
  return (
    <div className="relative mx-auto flex w-full max-w-[280px] flex-col items-center lg:max-w-none">
      <div className="relative aspect-square w-full max-w-[240px]">
        <motion.div
          aria-hidden
          className="absolute -inset-3 rounded-full"
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
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          {TIMELINE.map((entry, i) => {
            const { x, y } = markerPoint(i)
            const lit = i <= activeIndex
            return (
              <circle
                key={entry.time}
                cx={x}
                cy={y}
                r={lit ? 4.5 : 3}
                fill={lit ? 'var(--color-ember)' : 'rgba(255,255,255,0.25)'}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-ember">{active.time}</p>
          <p className="mt-2 px-4 font-body text-[11px] leading-snug text-offwhite/60">Day X of 365</p>
        </div>
      </div>
    </div>
  )
}

export default function Act5Grind() {
  const sectionRef = useRef()
  const skyRef = useRef()
  const arcRef = useRef()
  const cardRefs = useRef([])
  const lastIndexRef = useRef(0)
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
              }
            },
          },
        }
      )

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const fromX = i % 2 === 0 ? -60 : 60
        gsap.fromTo(
          el,
          { opacity: 0, x: fromX },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Subtle continuous parallax lag (separate from the x/opacity
        // reveal above — GSAP tracks each transform property per-tween,
        // so this doesn't fight the reveal): alternating cards drift at
        // slightly different rates for a bit of depth as you scroll past.
        gsap.to(el, {
          y: i % 2 === 0 ? -26 : -14,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="grind" ref={sectionRef} className="relative w-full py-32">
      <div ref={skyRef} className="absolute inset-0 -z-10 transition-none" style={{ backgroundColor: '#000004' }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-black/10 to-black/60" />

      <h2 className="relative z-10 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
        The Grind
      </h2>
      <p className="relative z-10 mx-auto mt-4 mb-16 max-w-md text-center font-body text-sm text-offwhite/50">
        Every day starts the same. What he does with it is what changed everything.
      </p>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 lg:grid-cols-[280px_1fr] lg:gap-20 lg:px-12">
        <div className="lg:sticky lg:top-32 lg:h-fit lg:self-start">
          <GrindWheel arcRef={arcRef} activeIndex={activeIndex} />
        </div>

        <div className="flex flex-col gap-16">
          {TIMELINE.map((entry, i) => (
            <div
              key={entry.time}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`glass-card w-full rounded-2xl p-6 sm:w-[70%] sm:p-8 ${
                i % 2 === 0 ? 'sm:self-start' : 'sm:self-end'
              }`}
            >
              <p className="font-heading text-sm font-bold uppercase tracking-[0.25em] text-ember">
                {entry.time}
              </p>
              <p className="mt-3 font-display text-xl font-bold text-offwhite sm:text-2xl">
                {entry.quote}
              </p>
              <p className="mt-2 font-body text-sm text-offwhite/60">{entry.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
