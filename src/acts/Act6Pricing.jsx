import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import EmberMark from '@/components/EmberMark'
import TierClaimForm from '@/components/TierClaimForm'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useSectionView from '@/lib/useSectionView'

const TIERS = [
  {
    key: 'conversation',
    name: 'A Conversation',
    price: '₹3,333',
    duration: '60 min',
    sentence: 'One conversation. Clarity on what’s actually stopping you.',
  },
  {
    key: 'reset',
    name: 'A Reset',
    price: '₹4,444',
    duration: '90 min',
    sentence: 'A deeper session. We go past the surface issue to the real one.',
  },
  {
    key: 'becoming',
    name: 'The Becoming',
    price: '₹11,111',
    duration: '4 weeks',
    sentence: 'Four weeks of direct access. This is where the shift actually locks in.',
  },
]

/**
 * "Choose your depth" — one interactive selector instead of three
 * side-by-side comparison cards. Reuses the site's own visual language
 * (glowing nodes on a track, same idea as the progress-thread markers)
 * rather than a generic pricing-table pattern. The deepest tier gets the
 * recurring EmberMark leitmotif instead of a "MOST POPULAR" badge.
 *
 * No payment processing here — Stripe vs Razorpay is still an open,
 * deliberate decision (see TierClaimForm). This is intake-only, same
 * honest limit as the Discovery Call booking flow.
 */
export default function Act6Pricing() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [claimingTier, setClaimingTier] = useState(null)

  useSectionView('pricing')

  const active = TIERS[activeIndex]

  const handleSelect = (i) => {
    if (i === activeIndex) return
    playUITick('hover')
    setActiveIndex(i)
  }

  const handleClaim = () => {
    playUITick('click')
    trackEvent('tier_cta_click', { tier: active.key })
    setClaimingTier(active)
  }

  return (
    <section
      id="pricing"
      className="isolate relative flex min-h-screen w-full flex-col items-center justify-center gap-12 overflow-hidden px-6 py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,107,53,0.08), transparent 60%)' }}
      />

      <div className="text-center">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">Chapter Five</p>
        <p className="mx-auto mt-1 max-w-md font-body text-sm italic text-offwhite/40">
          You know the method now. Here&rsquo;s how deep you want to go.
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold text-offwhite sm:text-5xl">What It Takes</h2>
      </div>

      {/* Node track — click a node to tune into that tier, rather than
          comparing three static cards side by side. */}
      <div className="relative flex w-full max-w-sm items-center justify-between px-4">
        <div className="absolute inset-x-4 h-px bg-white/10" />
        {TIERS.map((tier, i) => {
          const isActive = i === activeIndex
          const baseSize = 8 + i * 4
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => handleSelect(i)}
              aria-label={`Select ${tier.name}`}
              aria-pressed={isActive}
              className="relative z-10 flex h-10 w-10 items-center justify-center"
            >
              <motion.span
                animate={{
                  scale: isActive ? 1.6 : 1,
                  opacity: isActive ? 1 : 0.45,
                  boxShadow: isActive
                    ? '0 0 22px rgba(255,107,53,0.7)'
                    : '0 0 0px rgba(255,107,53,0)',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-full bg-ember"
                style={{ width: baseSize, height: baseSize }}
              />
            </button>
          )
        })}
      </div>

      {/* Content panel */}
      <div className="relative flex min-h-[260px] w-full max-w-xl items-center justify-center">
        {active.key === 'becoming' && (
          <EmberMark
            size="34vmin"
            opacity={0.55}
            className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-ember">{active.name}</p>
            <p className="mx-auto mt-4 max-w-md font-display text-2xl font-bold text-offwhite sm:text-3xl">
              {active.sentence}
            </p>
            <p className="mt-6 font-body text-sm text-offwhite/50">
              {active.price} · {active.duration}
            </p>
            <motion.button
              type="button"
              onClick={handleClaim}
              onMouseEnter={() => playUITick('hover')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-heavy mt-8 bg-ember px-8 py-4 text-sm text-void"
            >
              Claim {active.name}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {claimingTier && <TierClaimForm tier={claimingTier} onClose={() => setClaimingTier(null)} />}
      </AnimatePresence>
    </section>
  )
}
