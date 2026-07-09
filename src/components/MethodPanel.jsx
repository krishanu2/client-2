import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Canvas 2D wireframe body silhouette — a rotating-globe illusion (varying
 * ellipse widths over time) rather than a true 3D mesh. This used to be an
 * R3F <Canvas>, but that was a second/third WebGL context created after
 * the intro's, which was losing GPU context on real hardware. No WebGL
 * anywhere in this panel now.
 */
function WireframeBody() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (time) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w / 2
      const headCy = h * 0.32
      const headR = Math.min(w, h) * 0.16
      ctx.clearRect(0, 0, w, h)

      // Head — latitude/longitude wireframe globe illusion
      ctx.strokeStyle = 'rgba(212, 180, 131,0.28)'
      ctx.lineWidth = 1
      for (let i = -2; i <= 2; i++) {
        const ry = headR * (1 - Math.abs(i) * 0.18)
        ctx.beginPath()
        ctx.ellipse(cx, headCy + i * headR * 0.35, headR, ry * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      const spin = (time * 0.0004) % Math.PI
      for (let i = 0; i < 5; i++) {
        const t = (i / 5) * Math.PI + spin
        const rx = Math.abs(Math.cos(t)) * headR
        ctx.beginPath()
        ctx.ellipse(cx, headCy, rx, headR, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Torso — capsule-like wireframe outline
      ctx.strokeStyle = 'rgba(107, 91, 125,0.25)'
      const torsoTop = headCy + headR * 1.3
      const torsoBottom = h * 0.78
      const torsoW = headR * 1.5
      for (let i = 0; i <= 4; i++) {
        const y = torsoTop + ((torsoBottom - torsoTop) * i) / 4
        const widthFalloff = 1 - (i / 4) * 0.15
        ctx.beginPath()
        ctx.ellipse(cx, y, torsoW * widthFalloff, headR * 0.22, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(cx - torsoW, torsoTop)
      ctx.lineTo(cx - torsoW * 0.9, torsoBottom)
      ctx.moveTo(cx + torsoW, torsoTop)
      ctx.lineTo(cx + torsoW * 0.9, torsoBottom)
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(212, 180, 131,0.22), rgba(12,12,29,0.92) 55%, #000 100%)',
        }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

function NeuralNetwork() {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 34 }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (time) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      nodes.forEach((n, i) => {
        nodes.slice(i + 1).forEach((m) => {
          const d = Math.hypot(n.x - m.x, n.y - m.y)
          if (d < 160) {
            const pulse = (Math.sin(time * 0.001 + n.phase) + 1) / 2
            ctx.strokeStyle = `rgba(212, 180, 131,${0.08 + pulse * 0.18})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.stroke()
          }
        })
      })

      nodes.forEach((n) => {
        const pulse = (Math.sin(time * 0.0012 + n.phase) + 1) / 2
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2 + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(107, 91, 125,${0.4 + pulse * 0.5})`
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(107, 91, 125,0.25), rgba(12,12,29,0.92) 55%, #000 100%)',
        }}
        animate={{ scale: [1, 1.28, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}

function NebulaZoom() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(107, 91, 125,0.28), rgba(12,12,29,0.92) 55%, #000 100%)',
        }}
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 55% 55%, rgba(212, 180, 131,0.3), transparent 50%)',
        }}
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

const BACKGROUNDS = {
  wireframe: <WireframeBody />,
  neural: <NeuralNetwork />,
  nebulaZoom: <NebulaZoom />,
}

// Motion-as-meaning: each theme gets its own entrance personality instead
// of all three panels sharing identical timing — BODY steps on like
// something physical landing, MIND resolves from blur into focus, SOUL
// dissolves in slowly, like something remembered rather than announced.
const ENTRANCE_VARIANTS = {
  step: {
    title: {
      initial: { opacity: 0, y: 70, scale: 0.92 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: 'spring', stiffness: 140, damping: 15, delay: 0.15 },
    },
    body: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  blur: {
    title: {
      initial: { opacity: 0, filter: 'blur(18px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      transition: { delay: 0.15, duration: 0.9, ease: 'easeOut' },
    },
    body: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      transition: { delay: 0.35, duration: 0.8, ease: 'easeOut' },
    },
  },
  dissolve: {
    title: {
      initial: { opacity: 0, scale: 1.06 },
      animate: { opacity: 1, scale: 1 },
      transition: { delay: 0.15, duration: 1.4, ease: 'easeOut' },
    },
    body: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: 0.5, duration: 1.2, ease: 'easeOut' },
    },
  },
}

/**
 * Full-screen immersive panel for a Method word (BODY / MIND / SOUL).
 * `config` shape: { title, paragraphs, cta, background, extra, entrance }
 */
export default function MethodPanel({ config, onBack }) {
  const variant = ENTRANCE_VARIANTS[config.entrance] ?? ENTRANCE_VARIANTS.dissolve

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-30 overflow-y-auto bg-void"
    >
      <div className="absolute inset-0 opacity-40">{BACKGROUNDS[config.background]}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/85 to-void" />

      <button
        type="button"
        onClick={onBack}
        className="fixed left-6 top-6 z-40 font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-offwhite/60 hover:text-ember sm:left-10 sm:top-8"
      >
        ← Back
      </button>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24 sm:px-12">
        <motion.h2
          {...variant.title}
          className="font-display text-4xl font-extrabold text-offwhite sm:text-6xl"
        >
          {config.title}
        </motion.h2>

        <motion.div {...variant.body} className="mt-8 space-y-3">
          {config.paragraphs.map((p) => (
            <p key={p} className="font-body text-lg text-offwhite/75">
              {p}
            </p>
          ))}
        </motion.div>

        {config.extra}

        <motion.a
          href="#call"
          onClick={onBack}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-10 inline-block w-fit rounded-full border border-ember/50 bg-ember/10 px-7 py-3 font-heading text-sm font-bold uppercase tracking-[0.2em] text-ember backdrop-blur-sm transition-colors hover:bg-ember/20"
        >
          {config.cta}
        </motion.a>
      </div>
    </motion.div>
  )
}
