import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import CrackedSphere from '@/components/CrackedSphere'
import ShatterFragments from '@/components/ShatterFragments'
import ParticleFace from '@/components/ParticleFace'
import ContextLossHandler from '@/components/ContextLossHandler'
import { NebulaPlane } from '@/components/NebulaBackground'
import { prefersReducedMotion, supportsWebGL, probeDeviceCapability } from '@/lib/theme'
import { playShatterImpact, playAnticipationRiser } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'
import useTypewriter from '@/lib/useTypewriter'

const LINE_1 = "You've been living someone else's life."
const LINE_2 = 'That ends here.'

// The sphere/fragments live in a full-screen <Canvas> now (previously the
// sphere alone sat in a 60vmin box while the shatter had its own
// full-screen canvas) — the same camera distance renders a fixed-size
// object much larger on a full-screen canvas than a 60vmin one, so the
// radius is scaled down to land at a comparable on-screen size instead of
// dominating the whole viewport.
const SPHERE_RADIUS = 0.85

function CameraDolly({ active }) {
  const { camera } = useThree()
  useFrame((state, delta) => {
    if (active) {
      // Ease toward the target instead of a linear move + hard clamp —
      // the clamp read as an abrupt stop rather than a settle.
      camera.position.z += (3.2 - camera.position.z) * (1 - Math.exp(-2.5 * delta))
    }
  })
  return null
}

function JitteringSphere() {
  const groupRef = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      // Smooth band-limited noise instead of a fresh random offset every
      // frame — the old version was indistinguishable from real stutter.
      groupRef.current.position.x =
        (Math.sin(time * 9 + phase) + Math.sin(time * 13.7 + phase * 1.3) * 0.5) * 0.025
      groupRef.current.position.y =
        (Math.sin(time * 10.5 + phase * 0.8) + Math.sin(time * 15 + phase * 1.7) * 0.5) * 0.025
    }
  })
  return (
    <group ref={groupRef}>
      <CrackedSphere size={SPHERE_RADIUS} autoRotate pulse={1} />
    </group>
  )
}

/**
 * Small idle "alive" cue while the visitor reads the typewriter lines —
 * a subtle mouse-driven rotation offset on the sphere, eased in/out with
 * the given `active` flag rather than snapping.
 */
function IdleParallax({ active, mouseRef, children }) {
  const groupRef = useRef()
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const targetX = active ? mouseRef.current.y * 0.04 : 0
    const targetY = active ? mouseRef.current.x * 0.05 : 0
    const k = 1 - Math.exp(-3 * delta)
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * k
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * k
  })
  return <group ref={groupRef}>{children}</group>
}

const PHASES_SHOWING_TEXT = ['line1', 'line2']
const PHASES_SHOWING_SPHERE = ['line2', 'sphere', 'enter']
const PHASES_AFTER_REVEAL = ['sphere', 'enter', 'jitter', 'shatter', 'face', 'text1', 'text2']
const PHASES_SHOWING_FACE = ['face', 'text1', 'text2']

/**
 * ACT 1 (The Void) + ACT 2 (The Break) merged into a single persistent
 * <Canvas>. They used to be two separate components each mounting their
 * own WebGL context, torn down and recreated at the ENTER click — that
 * handoff was losing the WebGL context on real hardware (not just this
 * sandbox), which is what caused both the janky sphere/shatter animation
 * and Act 3's occasional blank canvas afterward. One continuous scene
 * means there is no context recreation anywhere in this sequence.
 */
export default function VoidAndBreak({ onComplete }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const webgl = useMemo(() => supportsWebGL(), [])
  const isMobile = useMemo(() => window.innerWidth < 640, [])
  const mouseRef = useRef({ x: 0, y: 0 })

  // black -> line1 -> line2 -> sphere -> enter -> [click] -> jitter -> shatter -> face -> text1 -> text2 -> done
  const [phase, setPhase] = useState('black')
  const [faceProgress, setFaceProgress] = useState(0)
  // One-shot capability read (no live renegotiation — see theme.js) so a
  // wide-viewport laptop with a weak GPU doesn't get full desktop-tier
  // particle/fragment counts just because it isn't "mobile" width.
  const [capability, setCapability] = useState('medium')

  useEffect(() => {
    let cancelled = false
    probeDeviceCapability().then((tier) => {
      if (!cancelled) setCapability(tier)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isMobile) return undefined
    const handleMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [isMobile])

  const qualityScale = capability === 'low' ? 0.5 : capability === 'medium' ? 0.8 : 1
  const fragmentCount = Math.round((isMobile ? 30 : 90) * qualityScale)
  const particleCount = Math.round((isMobile ? 350 : 800) * qualityScale)

  // Act 1 timeline
  useEffect(() => {
    const t = setTimeout(() => setPhase('line1'), reduced ? 0 : 800)
    return () => clearTimeout(t)
  }, [reduced])

  const line1 = useTypewriter(PHASES_SHOWING_TEXT.concat(PHASES_AFTER_REVEAL).includes(phase) ? LINE_1 : '', {
    speed: 42,
    instant: reduced,
    onDone: () => {
      if (phase === 'line1') setTimeout(() => setPhase('line2'), reduced ? 0 : 2000)
    },
  })

  const line2 = useTypewriter(phase === 'line2' || PHASES_AFTER_REVEAL.slice(1).includes(phase) ? LINE_2 : '', {
    speed: 42,
    instant: reduced,
    onDone: () => {
      if (phase === 'line2') setTimeout(() => setPhase('sphere'), reduced ? 0 : 1000)
    },
  })

  useEffect(() => {
    if (phase === 'sphere') {
      const t = setTimeout(() => setPhase('enter'), reduced ? 200 : 1600)
      return () => clearTimeout(t)
    }
    return undefined
  }, [phase, reduced])

  const handleEnter = () => {
    trackEvent('act1_void_entered')
    setPhase(reduced || !webgl ? 'face' : 'jitter')
  }

  // Act 2 timeline (post-ENTER)
  useEffect(() => {
    if (phase === 'jitter') {
      playAnticipationRiser(0.6)
      const t = setTimeout(() => setPhase('shatter'), 600)
      return () => clearTimeout(t)
    }
    return undefined
  }, [phase])

  useEffect(() => {
    if (phase === 'shatter') playShatterImpact()
  }, [phase])

  const handleShatterFinished = () => setPhase('face')
  const handleSkip = () => setPhase('done')

  useEffect(() => {
    if (phase === 'face') {
      setFaceProgress(1)
      const t = setTimeout(() => setPhase('text1'), reduced || !webgl ? 300 : 1600)
      return () => clearTimeout(t)
    }
    if (phase === 'text1') {
      const t = setTimeout(() => setPhase('text2'), 1400)
      return () => clearTimeout(t)
    }
    if (phase === 'text2') {
      const t = setTimeout(() => setPhase('done'), 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'done') {
      trackEvent('main_experience_reached')
      onComplete?.()
    }
    return undefined
  }, [phase, reduced, webgl, onComplete])

  const showText = PHASES_SHOWING_TEXT.includes(phase)
  const showSphereFallback = PHASES_SHOWING_SPHERE.includes(phase)
  const showEnter = phase === 'enter'
  const revealed = PHASES_AFTER_REVEAL.includes(phase)
  // Visible from frame one — impatient cold visitors (the majority of
  // first-time traffic) had no early exit before this, since it only used
  // to appear once the shatter sequence began.
  const showSkip = phase !== 'done'
  const blackedOut = !PHASES_SHOWING_FACE.includes(phase)

  return (
    <div
      className="fixed inset-0 z-10 transition-colors duration-[1400ms]"
      style={{ backgroundColor: blackedOut ? '#000' : 'transparent' }}
    >
      {/* Background photo for the "I am Karnjeet Vinod" reveal — the
          wrapping div's own background already goes transparent exactly
          during face/text1/text2 (see `blackedOut` above), so this layer
          just needs to sit behind everything and fade in on that same
          schedule; no extra phase logic needed. */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-[1400ms]"
        style={{
          backgroundImage: 'url(/images/karnjeet-reveal.png)',
          opacity: blackedOut ? 0 : 0.55,
        }}
      />
      <div
        className="absolute inset-0 -z-10 transition-opacity duration-[1400ms]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, #000 78%)',
          opacity: blackedOut ? 0 : 1,
        }}
      />

      <AnimatePresence>
        {showText && (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
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

      <AnimatePresence>
        {showSkip && (
          <motion.button
            key="skip"
            type="button"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-6 top-6 z-20 font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-offwhite/50 hover:text-offwhite sm:right-10 sm:top-8"
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence>

      {webgl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: reduced ? 0.3 : 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0"
        >
          <Canvas camera={{ position: [0, 0, 4.2], fov: 40 }} dpr={[1, 1.5]}>
            <ContextLossHandler />
            <NebulaPlane opacity={PHASES_SHOWING_FACE.includes(phase) ? 1 : 0} />
            <ambientLight intensity={0.4} />
            <CameraDolly active={phase === 'shatter'} />

            {PHASES_SHOWING_SPHERE.includes(phase) && (
              <IdleParallax active={!reduced && (phase === 'sphere' || phase === 'enter')} mouseRef={mouseRef}>
                <CrackedSphere size={SPHERE_RADIUS} autoRotate={!reduced} pulse={reduced ? 0 : 1} />
              </IdleParallax>
            )}
            {phase === 'jitter' && <JitteringSphere />}
            {(phase === 'jitter' || phase === 'shatter') && (
              <ShatterFragments
                count={fragmentCount}
                radius={SPHERE_RADIUS}
                active={phase === 'shatter'}
                jitter={phase === 'jitter'}
                onFinished={handleShatterFinished}
              />
            )}
            {PHASES_SHOWING_FACE.includes(phase) && (
              <ParticleFace count={particleCount} progress={faceProgress} />
            )}
          </Canvas>
        </motion.div>
      ) : (
        showSphereFallback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed left-1/2 top-1/2 h-[60vmin] w-[60vmin] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full sm:max-w-none"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(255,107,53,0.55), rgba(12,12,29,0.9) 60%)',
              boxShadow: '0 0 80px 20px rgba(255,107,53,0.35), inset 0 0 60px rgba(0,0,0,0.6)',
            }}
          />
        )
      )}

      <AnimatePresence>
        {showEnter && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center sm:bottom-20">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 1.1, duration: 1 }}
              className="mb-3 font-body text-xs text-offwhite/40"
            >
              One click. That&rsquo;s the first choice.
            </motion.p>
            <motion.button
              key="enter"
              type="button"
              onClick={handleEnter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-heading text-sm font-bold uppercase tracking-[0.35em] text-ember text-glow-ember"
            >
              <motion.span
                animate={reduced ? {} : { opacity: [1, 0.55, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Enter →
              </motion.span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence>
          {(phase === 'text1' || phase === 'text2') && (
            <motion.div
              key="lines"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="translate-x-[10vw] text-center sm:text-left"
            >
              <p className="font-display text-3xl font-extrabold text-offwhite sm:text-5xl">
                I am Karnjeet Vinod.
              </p>
              {phase === 'text2' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="mt-3 font-display text-3xl font-extrabold text-ember text-glow-ember sm:text-5xl"
                >
                  And I will break you open.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
