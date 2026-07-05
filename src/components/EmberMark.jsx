import { motion } from 'framer-motion'

/**
 * The site's recurring leitmotif: the Gate opens on a dark, cracked orb
 * the visitor has to choose to break open. This is that same orb, healed
 * and glowing from within — reused at a few narrative beats (About's
 * confession, Proof's evidence, and full-size at the final CTA) so it
 * reads as a mark that follows the story, not a one-off bookend. Pure
 * CSS/SVG (no WebGL; only the Gate is allowed a <Canvas>).
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
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.35), rgba(255,107,53,0.06) 55%, transparent 75%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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
      </svg>
    </div>
  )
}
