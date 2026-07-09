import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'

const GOALS = [
  { key: 'body', label: 'Body' },
  { key: 'mind', label: 'Mind' },
  { key: 'both', label: 'Both' },
]

const FIELD_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Front-end flow only — no Stripe wired up yet, by design (fee amount
 * and Stripe account aren't settled). The whole flow is built so that
 * `initiateSecurePayment` is the ONE place that needs to change: it
 * currently just simulates the round-trip with a delay, but it's already
 * shaped like a real handoff (intake -> "redirecting to payment" ->
 * confirmation) so swapping in a real Stripe Checkout redirect later
 * doesn't require touching the surrounding UI/state at all.
 *
 * No fee amount or payment mention appears anywhere in this form's
 * copy — that was deliberate (don't prime the visitor with a number
 * before they've committed to booking).
 */
export default function BookingForm({ onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [goal, setGoal] = useState('both')
  const [status, setStatus] = useState('form') // form -> redirecting -> done

  const initiateSecurePayment = ({ name, email, phone, goal }) => {
    // TODO: replace this whole function body with a real Stripe handoff —
    // call a serverless endpoint to create a Checkout Session for the
    // booking fee (amount TBD), then `window.location.href = session.url`.
    // Stripe redirects back to a success URL; that page (or a returned
    // query param) should drive `status` to 'done' the same way the
    // setTimeout below does for now.
    return new Promise((resolve) => {
      trackEvent('discovery_call_submitted', { name, email, phone, goal })
      setTimeout(resolve, 1400)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setStatus('redirecting')
    playUITick('confirm')

    await initiateSecurePayment({ name, email, phone, goal })
    setStatus('done')
    setTimeout(onClose, 2600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-void/90 px-6 backdrop-blur-md"
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
          {status === 'form' && (
            <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-ember">Step one</p>
              <h3 className="mt-2 font-display text-3xl leading-[0.95] text-offwhite sm:text-4xl">
                Claim Your Call.
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

                <motion.div {...FIELD_VARIANTS} transition={{ delay: 0.26, duration: 0.4 }}>
                  <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.25em] text-offwhite/50">
                    What are we working on?
                  </p>
                  <div className="flex gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => {
                          setGoal(g.key)
                          playUITick('hover')
                        }}
                        className={`flex-1 rounded-full border px-3 py-2 font-heading text-xs uppercase tracking-[0.15em] transition-colors ${
                          goal === g.key
                            ? 'border-ember bg-ember/15 text-ember'
                            : 'border-white/15 text-offwhite/50 hover:text-offwhite'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.button
                  {...FIELD_VARIANTS}
                  transition={{ delay: 0.33, duration: 0.4 }}
                  type="submit"
                  whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
                  className="btn-heavy rounded-full! mt-2 bg-ember px-8 py-4 text-sm text-void"
                >
                  Confirm My Spot
                </motion.button>
              </form>
            </motion.div>
          )}

          {status === 'redirecting' && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-10 text-center"
            >
              <motion.span
                className="mx-auto block h-8 w-8 rounded-full border-2 border-ember/30 border-t-ember"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
              <p className="mt-5 font-body text-sm text-offwhite/70">Securing your spot…</p>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="py-6 text-center"
            >
              <p className="font-display text-4xl text-ember text-shadow-hard-ember">Locked In.</p>
              <p className="mt-3 font-body text-sm text-offwhite/70">
                Good. Talk soon — check your inbox for the link.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
