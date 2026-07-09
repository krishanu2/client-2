import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { prefersReducedMotion } from '@/lib/theme'
import { playAnticipationRiser } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useTypewriter from '@/lib/useTypewriter'

const LINE_1 = "You've been living someone else's life."
const LINE_2 = 'That ends here.'

const PHASES_SHOWING_TEXT = ['line1', 'line2']
const PHASES_SHOWING_FACE = ['text1', 'text2']

/**
 * The Gate — client direction pivot (verbal, relayed): drop the cracked-
 * sphere/shatter WebGL sequence entirely. It was a visual flourish; what
 * actually stops a visitor is a direct, unmissable choice. So: two
 * typewriter lines, then one big, bold, impossible-to-miss button that
 * says exactly what pressing it does. No WebGL anywhere in the Gate now
 * — CrackedSphere/ShatterFragments/ParticleFace/NebulaBackground were
 * used nowhere else in the app, so they were deleted with this, not just
 * unmounted.
 */
export default function VoidAndBreak({ onComplete }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])

  // black -> line1 -> line2 -> cta -> [click] -> text1 -> text2 -> done
  const [phase, setPhase] = useState('black')

  useEffect(() => {
    const t = setTimeout(() => setPhase('line1'), reduced ? 0 : 800)
    return () => clearTimeout(t)
  }, [reduced])

  const line1 = useTypewriter(PHASES_SHOWING_TEXT.concat(['cta', 'text1', 'text2']).includes(phase) ? LINE_1 : '', {
    speed: 42,
    instant: reduced,
    onDone: () => {
      if (phase === 'line1') setTimeout(() => setPhase('line2'), reduced ? 0 : 2000)
    },
  })

  const line2 = useTypewriter(phase === 'line2' || ['cta', 'text1', 'text2'].includes(phase) ? LINE_2 : '', {
    speed: 42,
    instant: reduced,
    onDone: () => {
      if (phase === 'line2') setTimeout(() => setPhase('cta'), reduced ? 0 : 900)
    },
  })

  const handleEnter = () => {
    trackEvent('act1_void_entered')
    playAnticipationRiser(0.5)
    setPhase('text1')
  }

  // The custom cursor's glow has no job during this passive reveal —
  // nothing to click — and was landing directly on top of "GR8NESS" at
  // the exact moment it's revealed, since the cursor was still sitting
  // near the CTA button that triggered it. Hide it for this beat only.
  useEffect(() => {
    // toggle (not add-then-remove-in-cleanup) — this effect re-runs on
    // every phase change, and its own cleanup fires first each time, so
    // an unconditional remove-on-cleanup was wiping the class the
    // instant text1 handed off to text2, before this body could re-add
    // it for text2's own render.
    document.body.classList.toggle('cursor-glow-hidden', phase === 'text1' || phase === 'text2')
    return () => document.body.classList.remove('cursor-glow-hidden')
  }, [phase])

  const handleSkip = () => setPhase('done')

  useEffect(() => {
    if (phase === 'text1') {
      const t = setTimeout(() => setPhase('text2'), 1400)
      return () => clearTimeout(t)
    }
    if (phase === 'text2') {
      const t = setTimeout(() => setPhase('done'), reduced ? 1000 : 2400)
      return () => clearTimeout(t)
    }
    if (phase === 'done') {
      trackEvent('main_experience_reached')
      onComplete?.()
    }
    return undefined
  }, [phase, reduced, onComplete])

  const showText = PHASES_SHOWING_TEXT.includes(phase)
  const showCta = phase === 'cta'
  const showSkip = phase !== 'done'
  const blackedOut = !PHASES_SHOWING_FACE.includes(phase)

  return (
    <div
      className="fixed inset-0 z-10 transition-colors duration-[1400ms]"
      style={{ backgroundColor: blackedOut ? '#000' : '#0a0a0a' }}
    >
      {/* Two static, non-looping visual layers so the Gate isn't just
          flat black behind the text now that the WebGL sequence is gone
          — a fine blueprint-style grid (futuristic, precise) and a soft
          centered glow (depth). Neither moves once faded in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,180,131,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,180,131,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,180,131,0.1), transparent 70%)' }}
      />

      <AnimatePresence>
        {showSkip && (
          <motion.button
            key="skip"
            type="button"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-10 top-8 z-20 font-heading text-[10px] font-normal uppercase tracking-[0.4em] text-offwhite/35 hover:text-offwhite/80 sm:right-14 sm:top-10"
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence>
          {showText && (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-display text-2xl font-bold text-offwhite sm:text-4xl">{line1}</p>
              {line2 && (
                <p className="mt-4 font-display text-xl font-bold text-ember text-glow-ember sm:text-3xl">
                  {line2}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The hook. Everything before this was setup — this is the one
            thing on the whole page that has to make someone stop
            scrolling and press it. Big, unmissable, and says exactly
            what happens next instead of a vague "Enter". */}
        <AnimatePresence>
          {showCta && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex flex-col items-center"
            >
              <p className="mb-7 max-w-md font-body text-sm text-offwhite/50 sm:text-base">
                One press. Your entire lifestyle changes.
              </p>
              <motion.button
                type="button"
                onClick={handleEnter}
                whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
                animate={
                  reduced
                    ? {}
                    : {
                        boxShadow: [
                          '0 0 0 1px rgba(212, 180, 131,0.3), 0 0 24px 0px rgba(212, 180, 131,0.12)',
                          '0 0 0 1px rgba(212, 180, 131,0.5), 0 0 36px 2px rgba(212, 180, 131,0.22)',
                          '0 0 0 1px rgba(212, 180, 131,0.3), 0 0 24px 0px rgba(212, 180, 131,0.12)',
                        ],
                      }
                }
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-full px-14 py-5 font-heading text-base font-bold uppercase tracking-[0.25em] text-ember backdrop-blur-xl sm:px-20 sm:py-6 sm:text-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(212, 180, 131,0.1), rgba(255,255,255,0.02))',
                }}
              >
                Change My Life →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === 'text1' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-display text-3xl font-extrabold text-offwhite sm:text-5xl">
                I am Karnjeet Vinod.
              </p>
              <motion.div
                className="mx-auto mt-4 h-px bg-ember/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'center', width: '40%' }}
              />
            </motion.div>
          )}

          {/* "Welcome to GR8NESS" was a branded greeting — generic, and
              it broke the second-person address the rest of the site
              uses. This closes the loop on the CTA they just clicked
              instead, still landing on the brand name, but as a
              consequence, not a doormat. Also dropped the leftover
              font-editorial (DM Sans) override so this matches the
              Bodoni Moda everywhere else now instead of switching
              typefaces mid-sequence. */}
          {phase === 'text2' && (
            <motion.div
              key="titlecard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-lg uppercase tracking-[0.45em] text-offwhite/70 sm:text-xl">
                You just chose
              </p>
              <p className="mt-3 font-display text-5xl font-semibold text-ember sm:text-7xl">
                GR8NESS.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
