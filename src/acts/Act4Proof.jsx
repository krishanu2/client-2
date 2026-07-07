import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PolaroidCard from '@/components/PolaroidCard'
import EmberMark from '@/components/EmberMark'
import useSectionView from '@/lib/useSectionView'

const HINT_SEEN_KEY = 'gr8ness_proof_hint_seen'

// Real client before/after photos. The lines below are DRAFTS for the
// client to review/replace with the clients' actual words — deliberately
// no invented stats (13kg, "16 weeks", etc.) since we don't have their
// real numbers, and a fabricated stat next to a real name and face is
// worse than no stat at all. These drafts stick to voice/feeling only,
// which is safe to place-hold with.
const CARDS = [
  {
    name: 'Akshay',
    photoLabel: 'Before / After',
    photo: '/images/testimonial-akshay.jpeg',
    testimonial: 'I stopped chasing quick fixes and started actually showing up. That’s the whole difference.',
    desktopPos: { top: '6%', left: '6%', rotate: -7 },
  },
  {
    name: 'Dhanavish',
    photoLabel: 'Before / After',
    photo: '/images/testimonial-dhanavish.jpeg',
    testimonial: 'Karn didn’t just change how I train — he changed how I think about discipline.',
    desktopPos: { top: '4%', left: '58%', rotate: 6 },
  },
  {
    name: 'Aryan',
    photoLabel: 'Before / After',
    photo: '/images/testimonial-aryan.jpeg',
    testimonial: 'First coach who actually held me accountable instead of just sending a plan and disappearing.',
    desktopPos: { top: '48%', left: '22%', rotate: -5 },
  },
  {
    name: 'Client — Australia',
    photoLabel: 'Before / After',
    photo: '/images/testimonial-female-au.jpeg',
    testimonial: 'I came in doubting myself. I left training like someone who finally believes she can.',
    desktopPos: { top: '46%', left: '64%', rotate: 5 },
  },
]

export default function Act4Proof() {
  const [isMobile, setIsMobile] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const containerRef = useRef(null)

  useSectionView('proof')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Explicit "this is interactive" affordance — the peek-flip on the
  // first card is a subtle tease, but easy to miss entirely, so this is
  // the unambiguous, unmissable version. Shown once per session.
  useEffect(() => {
    if (sessionStorage.getItem(HINT_SEEN_KEY)) return undefined
    const el = document.getElementById('proof')
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowHint(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    sessionStorage.setItem(HINT_SEEN_KEY, '1')
  }

  return (
    <section id="proof" className="isolate relative min-h-screen w-full overflow-hidden pb-32 pt-24">
      <EmberMark
        size="24vmin"
        opacity={0.4}
        className="absolute left-1/2 top-24 -z-10 -translate-x-1/2"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.p
          initial={{ y: '6%', opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl px-6 text-center font-accent-italic text-4xl leading-tight text-offwhite/10 sm:text-6xl"
        >
          &ldquo;From underconfident and restrictive eating&hellip; to feeling her best.&rdquo;
        </motion.p>
      </div>

      <p className="relative z-10 text-center font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">
        Chapter Three
      </p>
      <p className="relative z-10 mx-auto mt-1 max-w-md px-6 text-center font-body text-sm italic text-offwhite/40">
        Belief isn&rsquo;t given on words alone. Here&rsquo;s the evidence.
      </p>
      <h2 className="relative z-10 mb-4 mt-3 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
        The Proof
      </h2>

      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pointer-events-none relative z-10 mb-12 text-center font-heading text-xs uppercase tracking-[0.3em] text-ember/80"
          >
            {isMobile ? 'tap a photo to flip it →' : 'drag a photo, or tap to flip it →'}
          </motion.p>
        )}
      </AnimatePresence>

      {isMobile ? (
        <div
          className="relative z-10 flex w-full max-w-full snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6"
          onTouchStart={dismissHint}
        >
          {CARDS.map((card, i) => (
            <div key={card.name} className="snap-center">
              <PolaroidCard card={card} draggable={false} index={i} peekOnMount={i === 0} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative z-10 mx-auto h-[95vh] max-w-5xl"
          onPointerDown={dismissHint}
        >
          {CARDS.map((card, i) => (
            <PolaroidCard
              key={card.name}
              card={card}
              index={i}
              peekOnMount={i === 0}
              containerRef={containerRef}
              style={{
                position: 'absolute',
                top: card.desktopPos.top,
                left: card.desktopPos.left,
                rotate: card.desktopPos.rotate,
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
