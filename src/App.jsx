import { lazy, Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CustomCursor from '@/components/CustomCursor'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'
import SectionFallback from '@/components/SectionFallback'
import SoundToggle from '@/components/SoundToggle'
import SEOContent from '@/components/SEOContent'
import ActTransitionOverlay from '@/components/ActTransitionOverlay'
import EmberAtmosphere from '@/components/EmberAtmosphere'
import useLenis from '@/lib/useLenis'
import { setDroneIntensity } from '@/lib/audioEngine'

// Lazy: none of these are needed for first paint. Each import fn is kept
// separate from its lazy() wrapper so it can also be called imperatively
// to *preload* the next stage's chunk while the current one still has
// seconds of dwell time left (see the preload effect below) — dynamic
// import() caches the module promise, so a later lazy() render of an
// already-preloaded chunk resolves instantly with no network wait, which
// is what keeps the stage-to-stage transitions from flashing a
// LoadingScreen mid-animation.
const importVoidAndBreak = () => import('@/acts/VoidAndBreak')
const importAct3 = () => import('@/acts/Act3Method')
const importAbout = () => import('@/acts/AboutKarnjeet')
const importAct4 = () => import('@/acts/Act4Proof')
const importAct5 = () => import('@/acts/Act5Grind')
const importAct6 = () => import('@/acts/Act6Call')

const VoidAndBreak = lazy(importVoidAndBreak)
const Act3Method = lazy(importAct3)
const AboutKarnjeet = lazy(importAbout)
const Act4Proof = lazy(importAct4)
const Act5Grind = lazy(importAct5)
const Act6Call = lazy(importAct6)

gsap.registerPlugin(ScrollTrigger)

function ScrollCue() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed bottom-8 left-1/2 z-40 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-ember"
          >
            ↓
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const INTRO_SEEN_KEY = 'gr8ness_intro_seen'

function App() {
  // Session-aware: a visitor who reloads mid-decision (arguably the
  // closest person to booking) shouldn't have to sit through the ~8s
  // intro a second time in the same session.
  const [stage, setStage] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SEEN_KEY) ? 'main' : 'intro'
  ) // intro (Act 1 + Act 2, one scene) -> handoff -> main
  const lenisRef = useLenis(stage === 'main')

  useEffect(() => {
    if (stage !== 'main' || !lenisRef.current) return undefined
    const lenis = lenisRef.current
    lenis.on('scroll', ScrollTrigger.update)
    return () => {
      lenis.off('scroll', ScrollTrigger.update)
    }
  }, [stage, lenisRef])

  // Refresh ScrollTrigger once layout has actually settled, rather than
  // guessing a flat delay — fonts swapping in and the About section's
  // real photos loading both shift section heights, which desyncs every
  // Act's own scroll-triggered reveals if ScrollTrigger measured too
  // early. A timeout alone can't know when that's actually done, so this
  // listens for the real signals and keeps a longer fallback only as a
  // safety net.
  useEffect(() => {
    if (stage !== 'main') return undefined
    let cancelled = false
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh()
    }

    document.fonts?.ready?.then(refresh)

    const images = Array.from(document.querySelectorAll('main img'))
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true })
    })

    const fallback = setTimeout(refresh, 1000)

    return () => {
      cancelled = true
      clearTimeout(fallback)
      images.forEach((img) => img.removeEventListener('load', refresh))
    }
  }, [stage])

  // Sonic peak-end: brighten the (already-playing, if enabled) drone as
  // the visitor scrolls toward Act 6, using overall page progress as one
  // shared driver rather than tying it separately to any single Act.
  useEffect(() => {
    if (stage !== 'main') return undefined
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setDroneIntensity(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [stage])

  // Preload the main-stage chunks while the intro (Act 1+2) still has
  // ~10+ seconds of dwell time left, so reaching 'main' never has to wait
  // on a cold dynamic import().
  useEffect(() => {
    if (stage === 'intro') {
      importAct3()
      importAbout()
      importAct4()
      importAct5()
      importAct6()
    }
  }, [stage])

  // A brief gap between unmounting the intro's <Canvas> and mounting Act
  // 3's — recreating a WebGL context in the same tick as disposing the
  // previous one was losing the context on real hardware (this is what
  // caused Act 3 to render blank). Neither canvas exists during the gap.
  useEffect(() => {
    if (stage !== 'handoff') return undefined
    const t = setTimeout(() => setStage('main'), 1500)
    return () => clearTimeout(t)
  }, [stage])

  const handleIntroComplete = () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    setStage('handoff')
  }

  return (
    <>
      <SEOContent />
      <CustomCursor />
      <SoundToggle className="bottom-6 right-6 sm:bottom-8 sm:right-8" />

      {stage === 'intro' && (
        <Suspense fallback={<LoadingScreen />}>
          <VoidAndBreak onComplete={handleIntroComplete} />
        </Suspense>
      )}

      {stage === 'main' && (
        <div className="relative">
          <Nav lenisRef={lenisRef} />
          <ScrollCue />
          <ActTransitionOverlay />
          <EmberAtmosphere />
          <main>
            <Suspense fallback={<SectionFallback />}>
              <Act3Method />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <AboutKarnjeet />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Act4Proof />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Act5Grind />
            </Suspense>
            <Suspense fallback={<SectionFallback />}>
              <Act6Call />
            </Suspense>
          </main>
          <Footer />
        </div>
      )}
    </>
  )
}

export default App
