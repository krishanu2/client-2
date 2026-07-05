import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PhotoPlaceholder from '@/components/PhotoPlaceholder'
import BookingForm from '@/components/BookingForm'
import EmberMark from '@/components/EmberMark'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useSectionView from '@/lib/useSectionView'

const WORDS = ['YOUR', 'GR8NESS', 'IS', 'WAITING.']

export default function Act6Call() {
  const [showForm, setShowForm] = useState(false)

  useSectionView('call')

  const handlePrimaryClick = (e) => {
    e.preventDefault()
    playUITick('click')
    trackEvent('cta_click', { target: 'discovery_call' })
    setShowForm(true)
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
      <EmberMark
        size="42vmin"
        className="absolute right-[8%] top-1/2 -z-10 -translate-y-1/2 sm:right-[12%]"
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
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">
            Chapter Five
          </p>
          <p className="mb-4 mt-1 max-w-sm font-body text-sm italic text-offwhite/40">
            You&rsquo;ve seen the method, the man, the proof, and the grind. One thing is left.
          </p>
        </div>
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
        </div>

        <AnimatePresence>{showForm && <BookingForm onClose={() => setShowForm(false)} />}</AnimatePresence>


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
