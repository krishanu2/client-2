import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PolaroidCard from '@/components/PolaroidCard'
import useSectionView from '@/lib/useSectionView'

const HINT_SEEN_KEY = 'gr8ness_proof_hint_seen'

const CARDS = [
  {
    name: 'Radhika',
    photoLabel: 'Before / After',
    testimonial:
      'Lost 13kg. Went from underconfident and restrictive eating to feeling her best. 16 weeks. Melbourne.',
    handle: '@radhikapahujak5',
    desktopPos: { top: '18%', left: '14%', rotate: -8 },
  },
  {
    name: 'Harshini',
    photoLabel: 'Progress',
    testimonial:
      '16-week transformation. Working a 9-5. Physique and mindset completely changed.',
    handle: '@harshini_ramesh96',
    desktopPos: { top: '38%', left: '55%', rotate: 6 },
  },
  {
    name: 'Client',
    photoLabel: 'Progress',
    testimonial: '24 weeks. Full-time job. Eating 200g of carbs. 49kg to 54kg of pure muscle.',
    handle: null,
    desktopPos: { top: '55%', left: '28%', rotate: -4 },
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
    <section id="proof" className="relative min-h-screen w-full overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.p
          initial={{ y: '10%' }}
          animate={{ y: '-10%' }}
          transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
          className="max-w-4xl px-6 text-center font-accent-italic text-4xl leading-tight text-offwhite/10 sm:text-6xl"
        >
          &ldquo;From underconfident and restrictive eating&hellip; to feeling her best.&rdquo;
        </motion.p>
      </div>

      <h2 className="relative z-10 mb-4 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
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
          className="relative z-10 mx-auto h-[70vh] max-w-5xl"
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
