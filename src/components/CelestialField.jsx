import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/theme'

// Positions are normalized (0-1) across the whole section, not just one
// side — x/y plus a depth (0 = distant/still, 1 = near/reactive) that
// drives both parallax distance and visual weight. Sparser through the
// center column (x 0.34-0.62) on purpose so it never competes with
// BODY/MIND/SOUL; real density everywhere else, including the left
// side, which is what the flat-planet version was missing.
const STONES = [
  { x: 0.08, y: 0.16, depth: 0.35, r: 5, tone: 'gold' },
  { x: 0.14, y: 0.34, depth: 0.7, r: 9, tone: 'plum' },
  { x: 0.06, y: 0.55, depth: 0.5, r: 6, tone: 'gold' },
  { x: 0.18, y: 0.72, depth: 0.85, r: 11, tone: 'gold' },
  { x: 0.1, y: 0.88, depth: 0.4, r: 5, tone: 'plum' },
  { x: 0.27, y: 0.12, depth: 0.6, r: 7, tone: 'plum' },
  { x: 0.29, y: 0.85, depth: 0.55, r: 6, tone: 'gold' },
  { x: 0.24, y: 0.5, depth: 0.3, r: 4, tone: 'gold' },
  { x: 0.68, y: 0.14, depth: 0.65, r: 8, tone: 'gold' },
  { x: 0.78, y: 0.22, depth: 0.4, r: 5, tone: 'plum' },
  { x: 0.88, y: 0.1, depth: 0.75, r: 10, tone: 'plum' },
  { x: 0.92, y: 0.32, depth: 0.5, r: 6, tone: 'gold' },
  { x: 0.7, y: 0.68, depth: 0.55, r: 7, tone: 'plum' },
  { x: 0.82, y: 0.8, depth: 0.8, r: 12, tone: 'gold' },
  { x: 0.93, y: 0.62, depth: 0.35, r: 5, tone: 'gold' },
  { x: 0.9, y: 0.86, depth: 0.6, r: 8, tone: 'plum' },
  { x: 0.62, y: 0.9, depth: 0.45, r: 6, tone: 'gold' },
  { x: 0.65, y: 0.06, depth: 0.3, r: 4, tone: 'plum' },
]

const PLANET = { x: 0.78, y: 0.46, depth: 0.9, r: 62 }

const TONES = {
  gold: { hi: '#f3e2c2', mid: '#d4b483', dark: '#5a4526' },
  plum: { hi: '#c9bcd6', mid: '#6b5b7d', dark: '#2c2534' },
}

function drawSphere(ctx, cx, cy, r, tone) {
  const c = TONES[tone]
  const grad = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.34, r * 0.05, cx, cy, r)
  grad.addColorStop(0, c.hi)
  grad.addColorStop(0.45, c.mid)
  grad.addColorStop(1, c.dark)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
}

/**
 * A star-chart, not a decoration — soul-stones scattered across the
 * *whole* section (not just one side), read as a personal constellation
 * with the planet (the real brand mark's own planet-with-rings motif) as
 * its anchor. Genuinely interactive: every point parallaxes off the
 * cursor at its own depth, the near ones moving more than the far ones,
 * so it responds to the visitor rather than looping on its own forever
 * — the same "motion should answer interaction, not run ambiently"
 * rule this site has followed since the animation-cleanup pass.
 * Constellation lines connect nearby stones so it also visually rhymes
 * with the section's own blueprint-grid background instead of sitting
 * on top of it as an unrelated graphic. Canvas2D, not WebGL — this
 * pass's reliability story was removing the site's last WebGL context.
 */
export default function CelestialField({ className = '' }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const interactive = !reduced && !isCoarsePointer

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    const pointer = { x: 0, y: 0 } // -1..1
    const eased = { x: 0, y: 0 }

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

    const handleMove = (e) => {
      const rect = canvas.parentElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }
    if (interactive) window.addEventListener('mousemove', handleMove)

    const MAX_SHIFT = 26 // px, at depth 1, before dpr scaling

    const draw = () => {
      eased.x += (pointer.x - eased.x) * 0.06
      eased.y += (pointer.y - eased.y) * 0.06
      ctx.clearRect(0, 0, width, height)

      const pts = STONES.map((s) => ({
        ...s,
        cx: s.x * width + eased.x * MAX_SHIFT * s.depth,
        cy: s.y * height + eased.y * MAX_SHIFT * s.depth,
      }))

      // Constellation lines — only between genuinely close neighbours,
      // faint, so it reads as a map rather than a web.
      ctx.strokeStyle = 'rgba(212,180,131,0.14)'
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].cx - pts[j].cx
          const dy = pts[i].cy - pts[j].cy
          const dist = Math.hypot(dx, dy)
          if (dist < width * 0.16) {
            ctx.beginPath()
            ctx.moveTo(pts[i].cx, pts[i].cy)
            ctx.lineTo(pts[j].cx, pts[j].cy)
            ctx.stroke()
          }
        }
      }

      pts.forEach((s) => drawSphere(ctx, s.cx, s.cy, s.r, s.tone))

      // The planet + its tilted ring, anchoring the field.
      const px = PLANET.x * width + eased.x * MAX_SHIFT * PLANET.depth
      const py = PLANET.y * height + eased.y * MAX_SHIFT * PLANET.depth
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate((-18 * Math.PI) / 180)
      ctx.scale(1, 0.3)
      ctx.beginPath()
      ctx.arc(0, 0, PLANET.r * 1.65, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(212,180,131,0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()
      drawSphere(ctx, px, py, PLANET.r, 'gold')

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      if (interactive) window.removeEventListener('mousemove', handleMove)
    }
  }, [])

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
