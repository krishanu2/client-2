import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PhotoPlaceholder from '@/components/PhotoPlaceholder'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useSectionView from '@/lib/useSectionView'

const WORDS = ['YOUR', 'GR8NESS', 'IS', 'WAITING.']

export default function Act6Call() {
  const [confirmed, setConfirmed] = useState(false)

  useSectionView('call')

  const handlePrimaryClick = () => {
    playUITick('confirm')
    trackEvent('cta_click', { target: 'discovery_call' })
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2600)
  }

  return (
    <section
      id="call"
      className="relative flex min-h-screen w-full flex-col overflow-hidden sm:flex-row"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, rgba(255,107,53,0.25), transparent 60%)',
        }}
      />

      <div className="relative h-[42vh] w-full overflow-hidden sm:h-auto sm:w-1/2">
        <motion.div
          className="h-full w-full"
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
        >
          <PhotoPlaceholder
            src="/images/karnjeet-lifestyle.jpeg"
            alt="Karnjeet Vinod"
            label="Karnjeet Vinod — @thegr8nessguy"
            variant="wide"
            className="h-full w-full"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent sm:bg-gradient-to-r" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col justify-center gap-8 px-6 py-16 sm:w-1/2 sm:px-16">
        <div>
          {WORDS.map((word, i) => (
            <motion.p
              key={word}
              initial={{ opacity: 0, y: 20, scale: word === 'GR8NESS' ? 1.15 : 1 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                word === 'GR8NESS'
                  ? { delay: i * 0.15, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } // slight overshoot
                  : { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              }
              className={`font-display text-6xl leading-[0.95] sm:text-8xl ${
                word === 'GR8NESS' ? 'text-ember text-shadow-hard-ember' : 'text-offwhite text-shadow-hard'
              }`}
            >
              {word}
            </motion.p>
          ))}
        </div>

        <p className="font-heading text-lg text-offwhite/70">
          One conversation. One decision. One beginning.
        </p>

        <div className="relative w-fit">
          <a
            href="#call"
            onMouseEnter={() => playUITick('hover')}
            onClick={handlePrimaryClick}
            className="btn-heavy heartbeat-cta relative z-10 block w-fit bg-ember px-10 py-5 text-sm text-void"
          >
            Book A Discovery Call
          </a>
          <AnimatePresence>
            {confirmed && (
              <motion.div
                initial={{ opacity: 0.55, scale: 0.6 }}
                animate={{ opacity: 0, scale: 2.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-full bg-ember"
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={confirmed ? 'confirmed' : 'default'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="-mt-4 font-body text-sm text-ember"
          >
            {confirmed ? 'Good. Talk soon — check your inbox for the link.' : ' '}
          </motion.p>
        </AnimatePresence>

        <a
          href="https://ig.me/m/thegr8nessguy"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => playUITick('hover')}
          onClick={() => trackEvent('cta_click', { target: 'instagram_dm' })}
          className="w-fit font-body text-sm text-offwhite/60 underline decoration-ember/40 underline-offset-4 hover:text-ember"
        >
          Or DM GR8NESS on Instagram →
        </a>

        <p className="font-body text-xs text-offwhite/40">
          @thegr8nessguy — Melbourne, Australia 🇦🇺
        </p>
      </div>
    </section>
  )
}
