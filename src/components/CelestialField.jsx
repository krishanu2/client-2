import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/theme'

// A real orrery, not a mouse toy — a sun at the centre (the same warm
// light that already sits behind BODY/MIND/SOUL) with planets on wide,
// slow, continuously turning elliptical orbits. Purely time-driven, no
// pointer input anywhere. Inner planets move faster than outer ones
// (real orbital mechanics, not just decoration) — that small bit of
// authenticity is what separates "premium" from "generic floating
// shapes." One planet carries a small moon of its own.
// The smallest orbit used to sit almost entirely within the text
// column's own width, so it was dimmed but never actually clear of the
// words — every orbit now has enough radius that it spends real time
// outside the text's horizontal footprint, not just brief moments.
const PLANETS = [
  { rx: 0.34, ry: 0.075, period: 34, phase: 0.1, size: 7, tone: 'gold' },
  { rx: 0.4, ry: 0.1, period: 50, phase: 2.4, size: 9, tone: 'plum', moon: { r: 0.045, period: 5, size: 3 } },
  { rx: 0.46, ry: 0.125, period: 68, phase: 4.4, size: 7, tone: 'gold' },
  { rx: 0.52, ry: 0.15, period: 90, phase: 1.3, size: 11, tone: 'plum' },
]

const TONES = {
  gold: { hi: '#f3e2c2', mid: '#d4b483', dark: '#5a4526' },
  plum: { hi: '#c9bcd6', mid: '#6b5b7d', dark: '#2c2534' },
  sun: { hi: '#fff6e2', mid: '#f0cf8e', dark: '#c99a4a' },
}

function drawSphere(ctx, cx, cy, r, tone, alpha = 1) {
  const c = TONES[tone]
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
}

/**
 * A slow, continuous orrery behind BODY/MIND/SOUL — explicitly NOT
 * pointer-driven per client direction ("should not be interactive...
 * automatic, not mouse-sensitive"). The sun sits where the section's own
 * warm glow already lived, planets sweep wide elliptical orbits across
 * the full width so the left side is no longer empty, and everything
 * moves purely off elapsed time. Canvas2D, not WebGL — this pass's
 * reliability story was removing the site's last WebGL context.
 */
export default function CelestialField({ className = '' }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

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
      // tilt the whole orbit plane slightly for perspective
      return {
        x: cx() + ex * Math.cos(TILT) - ey * Math.sin(TILT),
        y: cy() + ex * Math.sin(TILT) + ey * Math.cos(TILT),
        depth: Math.sin(angle), // -1 (far) .. 1 (near), for size/alpha
      }
    }

    const drawOrbitPath = (rxPx, ryPx) => {
      ctx.save()
      ctx.translate(cx(), cy())
      ctx.rotate(TILT)
      ctx.beginPath()
      ctx.ellipse(0, 0, rxPx, ryPx, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(212,180,131,0.12)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    const render = (t) => {
      const time = t / 1000
      ctx.clearRect(0, 0, width, height)

      // Sun — soft corona only, no solid core. This is the same warm
      // light that used to be a plain radial-gradient div behind the
      // text; now it has a reason to be there. A hard bright disc at
      // dead centre landed right on top of "BODY." (the text's own
      // vertical centre), so the glow alone carries "sun in the middle"
      // — it's diffuse enough to never read as sitting on a letter.
      const sunGlow = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), Math.min(width, height) * 0.32)
      sunGlow.addColorStop(0, 'rgba(240,207,142,0.35)')
      sunGlow.addColorStop(1, 'rgba(240,207,142,0)')
      ctx.fillStyle = sunGlow
      ctx.fillRect(0, 0, width, height)

      // Every elliptical orbit crosses the vertical line through the sun
      // twice per revolution — right where the text column sits, since
      // that's also centred on the sun. Rather than fight the geometry,
      // planets simply dim as they pass behind the text (a believable
      // "eclipsed by the words" read) and recover once clear, instead of
      // sitting on top of BODY/MIND/SOUL at full brightness.
      const textHalfWidth = Math.min(width * 0.5, 300)

      PLANETS.forEach((p) => {
        const rxPx = p.rx * width
        const ryPx = p.ry * height
        drawOrbitPath(rxPx, ryPx)

        const angle = reduced ? p.phase : p.phase + (time / p.period) * Math.PI * 2
        const pos = ellipsePoint(rxPx, ryPx, angle)
        const scale = 0.75 + (pos.depth + 1) * 0.2 // nearer = bigger
        let alpha = 0.55 + (pos.depth + 1) * 0.22 // nearer = brighter
        const dx = Math.abs(pos.x - cx())
        if (dx < textHalfWidth) {
          alpha *= 0.04 + 0.96 * (dx / textHalfWidth) ** 1.5
        }
        drawSphere(ctx, pos.x, pos.y, p.size * scale, p.tone, Math.min(alpha, 1))

        if (p.moon) {
          const moonAngle = reduced ? 0 : (time / p.moon.period) * Math.PI * 2
          const mx = pos.x + Math.cos(moonAngle) * p.moon.r * width
          const my = pos.y + Math.sin(moonAngle) * p.moon.r * width * 0.4
          drawSphere(ctx, mx, my, p.moon.size, 'gold', Math.min(alpha, 1))
        }
      })

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
