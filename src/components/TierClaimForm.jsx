import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'

const FIELD_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Front-end intake only, same honest limit as BookingForm — no payment
 * gateway wired up yet (Stripe vs Razorpay is a deliberate open decision,
 * not settled), so this collects intent and confirms manual next steps
 * rather than faking a checkout that doesn't actually charge anyone.
 * Swap handleSubmit for a real order-creation call once that's decided.
 */
export default function TierClaimForm({ tier, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('form') // form -> submitting -> done

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setStatus('submitting')
    playUITick('confirm')
    trackEvent('tier_claim_submitted', { name, email, phone, tier: tier.key })

    // TODO: replace with real order creation (Razorpay/Stripe) once decided.
    setTimeout(() => {
      setStatus('done')
      setTimeout(onClose, 2600)
    }, 700)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 px-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="stat-tile relative w-full max-w-md px-7 py-9 sm:px-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 font-heading text-xs uppercase tracking-[0.2em] text-offwhite/50 hover:text-ember"
        >
          Close ✕
        </button>

        <AnimatePresence mode="wait">
          {status !== 'done' ? (
            <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-ember">
                {tier.name} · {tier.price} · {tier.duration}
              </p>
              <h3 className="mt-2 font-display text-3xl leading-[0.95] text-offwhite sm:text-4xl">
                Claim This Spot.
              </h3>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
                <motion.input
                  {...FIELD_VARIANTS}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-b-2 border-white/15 bg-black/25 px-4 py-3 font-body text-sm text-offwhite placeholder:text-offwhite/35 focus:border-ember focus:outline-none"
                />
                <motion.input
                  {...FIELD_VARIANTS}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-b-2 border-white/15 bg-black/25 px-4 py-3 font-body text-sm text-offwhite placeholder:text-offwhite/35 focus:border-ember focus:outline-none"
                />
                <motion.input
                  {...FIELD_VARIANTS}
                  transition={{ delay: 0.19, duration: 0.4 }}
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-b-2 border-white/15 bg-black/25 px-4 py-3 font-body text-sm text-offwhite placeholder:text-offwhite/35 focus:border-ember focus:outline-none"
                />

                <motion.button
                  {...FIELD_VARIANTS}
                  transition={{ delay: 0.26, duration: 0.4 }}
                  type="submit"
                  disabled={status === 'submitting'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-heavy mt-2 bg-ember px-8 py-4 text-sm text-void disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : `Claim ${tier.name}`}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="py-6 text-center"
            >
              <p className="font-display text-4xl text-ember text-shadow-hard-ember">Claimed.</p>
              <p className="mt-3 font-body text-sm text-offwhite/70">
                You&rsquo;ve claimed {tier.name}. Payment details and a booking link will be sent
                to your email within 24 hours.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
