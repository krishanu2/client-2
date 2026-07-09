import { motion } from 'framer-motion'

// A proper lemniscate (figure-8 / infinity curve), not a rotated numeral —
// a font glyph rotated 90° at small sizes just reads as a blob. Traced
// parametrically so it's crisp at any size: x = a·cos(t), y = (a/2)·sin(2t).
function lemniscatePath(a, cx = 100, cy = 100, steps = 80) {
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * Math.PI * 2
    return [cx + a * Math.cos(t), cy + (a / 2) * Math.sin(2 * t)]
  })
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

/**
 * The site's recurring leitmotif: the Gate opens on a dark, cracked orb
 * the visitor has to choose to break open. This is that same orb, healed
 * and glowing from within — reused at a few narrative beats (About's
 * confession, Proof's evidence, and full-size at the final CTA) so it
 * reads as a mark that follows the story, not a one-off bookend. Pure
 * CSS/SVG (no WebGL; only the Gate is allowed a <Canvas>).
 *
 * The ring carries the site's other recurring symbol too: the "8" in
 * GR8NESS reads as infinity — his own name already says "infinite
 * becoming." Drawn as an actual lemniscate curve, not a font glyph.
 */
export default function EmberMark({ size = '42vmin', opacity = 1, className = '' }) {
  const rays = Array.from({ length: 10 }, (_, i) => (i / 10) * 360)
  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212, 180, 131,0.35), rgba(212, 180, 131,0.06) 55%, transparent 75%)' }}
        initial={{ scale: 0.94, opacity: 0.6 }}
        whileInView={{ scale: 1, opacity: 0.85 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        {rays.map((angle) => (
          <line
            key={angle}
            x1="100"
            y1="100"
            x2={100 + 95 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 95 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(255,200,160,0.25)"
            strokeWidth="1"
          />
        ))}
        <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(255,220,190,0.4)" strokeWidth="1.5" />
        <path
          d={lemniscatePath(30)}
          fill="none"
          stroke="rgba(255,225,200,0.55)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
