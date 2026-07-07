import { useState } from 'react'
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
      'You’ve started over more times than you’d admit out loud.',
      'This time someone’s actually watching. Every week. No disappearing.',
    ],
    cta: 'This is where it starts →',
    extra: (
      <div className="mt-8 flex flex-wrap gap-4">
        {[
          { stat: '-13kg', sub: '16 weeks' },
          { stat: '49 → 54kg', sub: 'lean muscle, 24 weeks' },
          { stat: '9-5 + coaching', sub: 'still transformed' },
        ].map((s) => (
          <div key={s.stat} className="stat-tile px-4 py-3">
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
      'You already know what to do. Knowing was never the problem.',
      'You negotiate with yourself every single day. This is where that ends.',
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
      'There’s a version of you that you stopped listening to a long time ago.',
      'This is how you remember him.',
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

// Classy over busy: this used to spin forever, unprompted. Now it only
// turns while the visitor is actually hovering that word — motion as a
// response, not ambient wallpaper — and eases to a stop otherwise.
function WordGlow({ color, scale = 1, spin = 9, spinning = false }) {
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
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spinning
          ? { duration: spin, repeat: Infinity, ease: 'linear' }
          : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
      }
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
  const [hoveredWord, setHoveredWord] = useState(null)
  // Permanent caption, not a 4-second tooltip — it only goes away once the
  // visitor has actually clicked a word (this session), since the problem
  // was visitors not realizing these were buttons at all, not needing a
  // reminder later.
  const [hasInteracted, setHasInteracted] = useState(
    () => typeof window !== 'undefined' && !!sessionStorage.getItem(HINT_SEEN_KEY)
  )

  useSectionView('method')

  const dismissHint = () => {
    setHasInteracted(true)
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
    <section id="method" className="isolate relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-32">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[30vw] w-[30vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.07), transparent 70%)' }}
        initial={{ opacity: 0.3 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6 }}
        className="mb-2 text-center"
      >
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">Chapter One</p>
        <p className="mt-1 font-heading text-xs font-bold uppercase tracking-[0.35em] text-ember">The Method</p>
        <p className="mt-2 font-body text-sm text-offwhite/50">Three doors. Pick one to go deeper.</p>
      </motion.div>

      {WORDS.map((w, i) => (
        <motion.button
          key={w.key}
          type="button"
          onClick={() => handleSelect(w.key)}
          onHoverStart={() => {
            dismissHint()
            playUITick('hover')
            setHoveredWord(w.key)
          }}
          onHoverEnd={() => setHoveredWord(null)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="isolate relative font-display text-shadow-hard-ember text-6xl text-ember sm:text-7xl"
        >
          <WordGlow color={w.glow} scale={w.scale} spin={w.spin} spinning={hoveredWord === w.key} />
          {w.label}
        </motion.button>
      ))}

      <AnimatePresence>
        {!hasInteracted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none mt-4 font-heading text-xs uppercase tracking-[0.3em] text-offwhite/40"
          >
            tap a word to go deeper →
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
