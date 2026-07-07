import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { enableSound, disableSound } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'

/**
 * On by default. Browsers still block audio until a real user gesture, so
 * this also arms a one-time listener on the very first pointer/key/touch
 * anywhere on the page to unlock it — the visitor doesn't have to find and
 * click this toggle specifically for sound to start.
 */
export default function SoundToggle({ className = '' }) {
  const [on, setOn] = useState(true)

  useEffect(() => {
    if (!on) return undefined
    const unlock = () => enableSound()
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach((evt) => window.addEventListener(evt, unlock, { once: true }))
    return () => events.forEach((evt) => window.removeEventListener(evt, unlock))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    if (next) {
      enableSound()
    } else {
      disableSound()
    }
    trackEvent('sound_toggle', { on: next })
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Unmute sound'}
      className={`fixed z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-offwhite/70 opacity-40 backdrop-blur-sm transition-opacity duration-300 hover:text-ember hover:opacity-100 ${className}`}
    >
      {on ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
          <path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </motion.button>
  )
}
