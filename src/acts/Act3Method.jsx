import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MethodPanel from '@/components/MethodPanel'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useSectionView from '@/lib/useSectionView'

const HINT_SEEN_KEY = 'gr8ness_method_hint_seen'

const PANELS = {
  body: {
    title: 'Your Body Is The Blueprint',
    background: 'wireframe',
    entrance: 'step',
    paragraphs: [
      'You’ve started over more times than you’d admit out loud — diets built for someone else’s schedule, programs that assumed a version of your life you don’t actually have.',
      'This is built around your real one instead — individualised training, adjusted every single week based on what actually happened, not what should have.',
      'Weekly check-ins — photos, numbers, honesty. Not because you need watching, but because you’ve never had someone who wouldn’t let you quietly disappear when it got hard.',
    ],
    cta: 'This is where it starts →',
    extra: (
      <div className="mt-8 flex flex-wrap gap-4">
        {[
          { stat: '-13kg', sub: '16 weeks' },
          { stat: '49 → 54kg', sub: 'lean muscle, 24 weeks' },
          { stat: '9-5 + coaching', sub: 'still transformed' },
        ].map((s) => (
          <div key={s.stat} className="glass-card rounded-lg px-4 py-3">
            <p className="font-display text-xl font-extrabold text-ember">{s.stat}</p>
            <p className="font-body text-xs text-offwhite/50">{s.sub}</p>
          </div>
        ))}
      </div>
    ),
  },
  mind: {
    title: 'Your Mind Is The Battlefield',
    background: 'neural',
    entrance: 'blur',
    paragraphs: [
      'You already know what to do. You’ve known for years. And you still don’t do it — not because you’re lazy, but because knowing was never actually the problem.',
      'This is pattern-breaking and identity work, not more information — weekly calls that go after the thing underneath the thing.',
    ],
    cta: 'Rewire everything →',
    extra: (
      <p className="mt-8 max-w-md font-accent-italic text-2xl text-violet text-glow-violet">
        &ldquo;I stopped negotiating with my own mind. That&rsquo;s when everything changed.&rdquo;
      </p>
    ),
  },
  soul: {
    title: 'Your Soul Already Knows',
    background: 'nebulaZoom',
    entrance: 'dissolve',
    paragraphs: [
      'Somewhere underneath the workouts and the routines, there’s a version of you that already knows who you’re supposed to be. You just stopped listening to it a while ago.',
      'This is the foundation underneath the training and the mindset work — not a philosophy to adopt, but the one you already had before life talked you out of it.',
    ],
    cta: 'Begin the becoming →',
    extra: (
      <p className="mt-8 font-accent-italic text-3xl text-offwhite sm:text-4xl">
        &ldquo;Greatness isn&rsquo;t something you chase. It&rsquo;s something you remember.&rdquo;
      </p>
    ),
  },
}

// Intensity steps up Body → Mind → Soul (bigger, slightly brighter, faster
// spin per word) so going deeper is felt, not just scrolled — kept as
// small, deliberate steps rather than a jump, after the background-emblem
// overshoot taught us to calibrate one step at a time.
const WORDS = [
  { key: 'body', label: 'BODY.', glow: 'rgba(255,107,53,0.28)', scale: 1, spin: 10 },
  { key: 'mind', label: 'MIND.', glow: 'rgba(139,92,246,0.32)', scale: 1.1, spin: 8.5 },
  { key: 'soul', label: 'SOUL.', glow: 'rgba(232,232,232,0.3)', scale: 1.2, spin: 7 },
]

// The brand's own wordmark as a faint background texture — a single
// stroked-only outline, small and quiet enough to sit behind BODY/MIND/SOUL
// without competing with them for the eye.
function GR8NESSMark() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-20 -translate-x-1/2 -translate-y-1/2 select-none">
      <motion.p
        className="whitespace-nowrap font-display text-[15vw] leading-none sm:text-[11vw]"
        style={{ WebkitTextStroke: '1.5px rgba(255,107,53,0.16)', color: 'transparent' }}
        animate={{ rotate: [-2, -0.5, -2] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        GR8NESS
      </motion.p>
    </div>
  )
}

function WordGlow({ color, scale = 1, spin = 9 }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 sm:h-[280px] sm:w-[280px]"
      style={{
        background: `conic-gradient(from 0deg, transparent, ${color}, transparent 55%)`,
        filter: 'blur(32px)',
        borderRadius: '9999px',
        scale,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: spin, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/**
 * BODY/MIND/SOUL as CSS/Framer Motion only — no WebGL here. This used to
 * float as 3D text in its own <Canvas>, but that was the second WebGL
 * context created in the session (after the intro's), and every second
 * context creation was losing GPU context on real hardware, leaving this
 * section blank. Reliability over the parallax flourish for now; revisit
 * once the underlying WebGL constraint is understood.
 */
export default function Act3Method() {
  const [activeWord, setActiveWord] = useState(null)
  const [showHint, setShowHint] = useState(false)

  useSectionView('method')

  useEffect(() => {
    if (sessionStorage.getItem(HINT_SEEN_KEY)) return undefined
    const el = document.getElementById('method')
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowHint(true)
          const t = setTimeout(() => dismissHint(), 4000)
          observer.disconnect()
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    sessionStorage.setItem(HINT_SEEN_KEY, '1')
  }

  const handleSelect = (key) => {
    dismissHint()
    playUITick('click')
    trackEvent('method_word_click', { word: key })
    setActiveWord(key)
  }

  const handleBack = () => setActiveWord(null)

  return (
    <section id="method" className="isolate relative flex min-h-screen w-full flex-col items-center justify-center gap-10 overflow-hidden py-32">
      <GR8NESSMark />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[30vw] w-[30vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.07), transparent 70%)' }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {WORDS.map((w, i) => (
        <motion.button
          key={w.key}
          type="button"
          onClick={() => handleSelect(w.key)}
          onHoverStart={() => {
            dismissHint()
            playUITick('hover')
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="isolate relative font-display text-shadow-hard-ember text-6xl text-ember sm:text-7xl"
        >
          <WordGlow color={w.glow} scale={w.scale} spin={w.spin} />
          {w.label}
        </motion.button>
      ))}

      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute bottom-20 font-heading text-xs uppercase tracking-[0.3em] text-offwhite/40"
          >
            tap a word →
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeWord && (
          <MethodPanel key={activeWord} config={PANELS[activeWord]} onBack={handleBack} />
        )}
      </AnimatePresence>
    </section>
  )
}
