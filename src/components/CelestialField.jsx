import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/theme'

// Real orbital mechanics, not decoration — inner planets move faster
// than outer ones. One carries its own moon. Orbits are wide enough that
// none sits entirely within the text column's own width (an earlier
// pass had one that never actually cleared the words).
const PLANETS = [
  { rx: 0.34, ry: 0.075, period: 34, phase: 0.1, size: 7, tone: 'gold' },
  { rx: 0.4, ry: 0.1, period: 50, phase: 2.4, size: 9, tone: 'plum', moon: { r: 0.045, period: 5, size: 3 } },
  { rx: 0.46, ry: 0.125, period: 68, phase: 4.4, size: 7, tone: 'gold' },
  { rx: 0.52, ry: 0.15, period: 90, phase: 1.3, size: 11, tone: 'plum' },
]

const TONES = {
  gold: { hi: '#f3e2c2', mid: '#d4b483', dark: '#4a3a24' },
  plum: { hi: '#c9bcd6', mid: '#6b5b7d', dark: '#221c29' },
}

// Sparse, slow, near-invisible dust — time-driven only, per client
// direction that nothing here should react to the pointer. Each mote
// drifts on its own long, gentle sine path rather than a straight line,
// so it never reads as "particles.js."
const DUST = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 0.371) % 1,
  y: (i * 0.617 + 0.15) % 1,
  amp: 0.01 + (i % 5) * 0.004,
  speed: 0.02 + (i % 4) * 0.008,
  phase: i * 1.7,
  size: 0.6 + (i % 3) * 0.5,
  alpha: 0.02 + (i % 3) * 0.01,
}))

function drawSphere(ctx, cx, cy, r, tone, alpha = 1) {
  const c = TONES[tone]

  // Soft bloom — a wider, fainter halo behind the sphere itself, so it
  // reads as luminous rather than a flat cutout.
  ctx.save()
  ctx.globalAlpha = alpha * 0.5
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.6)
  bloom.addColorStop(0, c.mid)
  bloom.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = bloom
  ctx.beginPath()
  ctx.arc(cx, cy, r * 2.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body — gradient offset toward the sun for a believable lit face,
  // shadow falling away on the far side.
  ctx.save()
  ctx.globalAlpha = alpha
  const grad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.34, r * 0.05, cx, cy, r)
  grad.addColorStop(0, c.hi)
  grad.addColorStop(0.45, c.mid)
  grad.addColorStop(1, c.dark)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // Rim light — a thin bright crescent on the sun-facing edge. This is
  // what makes a flat gradient circle read as a physical sphere with a
  // light source, not a sticker.
  ctx.save()
  ctx.globalAlpha = alpha * 0.7
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.98, Math.PI * 1.1, Math.PI * 1.65)
  ctx.strokeStyle = c.hi
  ctx.lineWidth = Math.max(0.6, r * 0.12)
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

/**
 * Real orrery — sun's glow at the centre, planets on continuously
 * turning elliptical orbits, purely time-driven (no pointer input
 * anywhere, per explicit client direction). This pass adds: orbit lines
 * that fade/thin with distance from centre instead of a uniform stroke,
 * physically-lit planets (bloom + rim light + directional shadow), sparse
 * near-invisible drifting dust, and an optional light-interaction API —
 * when a planet passes near a given DOM element (BODY/MIND/SOUL), that
 * element gets a brief, subtle glow boost, applied by direct style
 * mutation (not React state) to stay off the render thread.
 * Canvas2D throughout, not WebGL.
 */
export default function CelestialField({ className = '', wordTargets = [] }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const boostsRef = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const cx = () => width * 0.5
    const cy = () => height * 0.42
    const TILT = (-14 * Math.PI) / 180

    const ellipsePoint = (rxPx, ryPx, angle) => {
      const ex = Math.cos(angle) * rxPx
      const ey = Math.sin(angle) * ryPx
      return {
        x: cx() + ex * Math.cos(TILT) - ey * Math.sin(TILT),
        y: cy() + ex * Math.sin(TILT) + ey * Math.cos(TILT),
        depth: Math.sin(angle),
      }
    }

    // Segmented, fading orbit path — brighter and slightly thicker near
    // the centre, thinning and fading toward the far edges instead of a
    // single uniform stroke. A fixed per-segment jitter (seeded once,
    // not re-randomised per frame) keeps it from ever looking like a
    // perfect CAD ellipse.
    const orbitJitter = new Map()
    const drawOrbitPath = (rxPx, ryPx, key) => {
      const SEGMENTS = 96
      if (!orbitJitter.has(key)) {
        orbitJitter.set(
          key,
          Array.from({ length: SEGMENTS }, () => 0.85 + Math.random() * 0.3)
        )
      }
      const jitter = orbitJitter.get(key)
      ctx.save()
      ctx.translate(cx(), cy())
      ctx.rotate(TILT)
      for (let i = 0; i < SEGMENTS; i++) {
        const a0 = (i / SEGMENTS) * Math.PI * 2
        const a1 = ((i + 1.02) / SEGMENTS) * Math.PI * 2
        const mid = Math.sin((a0 + a1) / 2)
        // near the front of the ellipse (mid > 0) = closer/brighter;
        // back of the ellipse = fainter, thinner, softer.
        const front = (mid + 1) / 2
        const alpha = (0.05 + front * 0.16) * jitter[i]
        const w = 0.6 + front * 0.9
        ctx.beginPath()
        ctx.ellipse(0, 0, rxPx, ryPx, 0, a0, a1)
        ctx.strokeStyle = `rgba(212,180,131,${alpha.toFixed(3)})`
        ctx.lineWidth = w
        ctx.stroke()
      }
      ctx.restore()
    }

    const render = (t) => {
      const time = t / 1000
      ctx.clearRect(0, 0, width, height)

      // Sun glow only — no solid core (a hard disc at dead-centre used
      // to sit right on top of "BODY."). The diffuse glow alone carries
      // "sun in the middle." It breathes on a slow, irregular cycle
      // (100 -> 104 -> 99 -> 103 -> 100, ~15s) rather than a plain
      // sine pulse, so it never reads as an obvious mechanical pulse.
      const breathPeriod = 15
      const bt = ((time % breathPeriod) / breathPeriod) * Math.PI * 2
      const breathe = 1 + Math.sin(bt) * 0.025 + Math.sin(bt * 2.7 + 1.1) * 0.012
      const sunRadius = Math.min(width, height) * 0.32 * breathe
      const sunGlow = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), sunRadius)
      sunGlow.addColorStop(0, 'rgba(240,207,142,0.35)')
      sunGlow.addColorStop(1, 'rgba(240,207,142,0)')
      ctx.fillStyle = sunGlow
      ctx.fillRect(0, 0, width, height)

      // Dust — sparse, slow, near-invisible; drifts on a gentle sine
      // path so it never reads as a generic particle system.
      DUST.forEach((d) => {
        const dx = d.x * width + Math.sin(time * d.speed + d.phase) * d.amp * width
        const dy = d.y * height + Math.cos(time * d.speed * 0.7 + d.phase) * d.amp * height * 0.6
        ctx.beginPath()
        ctx.arc(dx, dy, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(243,226,194,${d.alpha})`
        ctx.fill()
      })

      const textHalfWidth = Math.min(width * 0.5, 300)

      // Read word target rects once per frame (before any writes below,
      // to avoid layout thrash), for the light-interaction pass.
      const canvasRect = canvas.getBoundingClientRect()
      const targets = wordTargets
        .map((wt) => {
          const el = wt.ref?.current
          if (!el) return null
          const r = el.getBoundingClientRect()
          return {
            key: wt.key,
            el,
            cx: r.left + r.width / 2 - canvasRect.left,
            cy: r.top + r.height / 2 - canvasRect.top,
            radius: Math.max(r.width, r.height) * 0.7,
          }
        })
        .filter(Boolean)
      const proximityThisFrame = {}

      PLANETS.forEach((p, i) => {
        const rxPx = p.rx * width
        const ryPx = p.ry * height
        drawOrbitPath(rxPx, ryPx, i)

        const angle = reduced ? p.phase : p.phase + (time / p.period) * Math.PI * 2
        const pos = ellipsePoint(rxPx, ryPx, angle)
        const scale = 0.75 + (pos.depth + 1) * 0.2
        let alpha = 0.55 + (pos.depth + 1) * 0.22
        const dx = Math.abs(pos.x - cx())
        if (dx < textHalfWidth) {
          alpha *= 0.04 + 0.96 * (dx / textHalfWidth) ** 1.5
        }
        drawSphere(ctx, pos.x, pos.y, p.size * scale, p.tone, Math.min(alpha, 1))

        targets.forEach((tgt) => {
          const d = Math.hypot(pos.x - tgt.cx, pos.y - tgt.cy)
          const proximity = Math.max(0, 1 - d / (tgt.radius + 140))
          proximityThisFrame[tgt.key] = Math.max(proximityThisFrame[tgt.key] || 0, proximity)
        })

        if (p.moon) {
          const moonAngle = reduced ? 0 : (time / p.moon.period) * Math.PI * 2
          const mx = pos.x + Math.cos(moonAngle) * p.moon.r * width
          const my = pos.y + Math.sin(moonAngle) * p.moon.r * width * 0.4
          drawSphere(ctx, mx, my, p.moon.size, 'gold', Math.min(alpha, 1))
        }
      })

      // Ease each word's glow boost toward this frame's proximity and
      // write it directly to the DOM — no React state, so this never
      // triggers a re-render.
      targets.forEach((tgt) => {
        const target = proximityThisFrame[tgt.key] || 0
        const prev = boostsRef.current[tgt.key] || 0
        const next = prev + (target - prev) * 0.03
        boostsRef.current[tgt.key] = next
        if (next > 0.003 || prev > 0.003) {
          tgt.el.style.setProperty('--glow-boost', next.toFixed(3))
        }
      })

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [wordTargets])

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
