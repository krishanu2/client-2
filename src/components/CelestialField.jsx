import { motion } from 'framer-motion'

// Soul-stone / chakra-point orbs scattered around the planet — each one
// a genuine glossy 3D sphere via CSS alone (radial-gradient highlight +
// inset shadow for depth), not a flat circle. Two-tone: gold (Body/
// grounding) and plum (Mind/Soul) — the site's own established accent
// pair, not literal chakra rainbow colors, so it stays inside the
// existing palette instead of clashing with it.
const STONES = [
  { size: 34, top: '12%', left: '18%', tone: 'gold', blur: 0, depth: 1 },
  { size: 18, top: '68%', left: '8%', tone: 'plum', blur: 1, depth: 0.6 },
  { size: 22, top: '78%', left: '32%', tone: 'gold', blur: 0.5, depth: 0.75 },
  { size: 14, top: '8%', left: '58%', tone: 'plum', blur: 1.5, depth: 0.5 },
  { size: 26, top: '38%', left: '4%', tone: 'plum', blur: 0.5, depth: 0.8 },
  { size: 16, top: '92%', left: '62%', tone: 'gold', blur: 1, depth: 0.55 },
]

const TONES = {
  gold: { hi: '#f3e2c2', mid: '#d4b483', dark: '#7a5f3a', glow: 'rgba(212,180,131,0.55)' },
  plum: { hi: '#c9bcd6', mid: '#6b5b7d', dark: '#372e42', glow: 'rgba(107,91,125,0.55)' },
}

function Stone({ size, top, left, tone, blur, depth }) {
  const c = TONES[tone]
  return (
    <motion.div
      aria-hidden
      className="absolute rounded-full"
      style={{
        top,
        left,
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        opacity: 0.4 + depth * 0.5,
        background: `radial-gradient(circle at 32% 28%, ${c.hi}, ${c.mid} 45%, ${c.dark} 100%)`,
        boxShadow: `inset -${size * 0.18}px -${size * 0.18}px ${size * 0.4}px rgba(0,0,0,0.55), 0 0 ${size * 0.9}px ${c.glow}`,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 0.4 + depth * 0.5, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.4, delay: depth * 0.3, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}

/**
 * A real dimensional composition instead of flat graphic filler — the
 * client's own brand mark (gr8ness-emblem.jpeg) is literally a planet
 * with rings, so this extends that identity into the page itself rather
 * than inventing a new motif. Pure CSS/SVG (gradients + shadows for the
 * glossy-sphere illusion, an ellipse for the ring's perspective tilt) —
 * deliberately not WebGL, since the site's whole reliability story this
 * pass was removing the last WebGL context for cross-device crash
 * safety; a decorative background isn't worth reopening that risk.
 * Static once settled — no ambient looping motion.
 */
export default function CelestialField({ className = '' }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <motion.div
        className="relative h-full w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The planet — glossy sphere via radial gradient + inset shadow */}
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '38vmin',
            height: '38vmin',
            minWidth: 220,
            minHeight: 220,
            background: 'radial-gradient(circle at 34% 28%, #f3e2c2, #d4b483 38%, #5a4526 78%, #1a1409 100%)',
            boxShadow: 'inset -30px -30px 70px rgba(0,0,0,0.65), inset 10px 8px 30px rgba(255,240,210,0.15), 0 0 90px rgba(212,180,131,0.25)',
          }}
          initial={{ scale: 0.9, x: '-50%', y: '-50%' }}
          whileInView={{ scale: 1, x: '-50%', y: '-50%' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* The ring — an ellipse tilted for perspective, matching the
            emblem's own ring geometry. Two strokes (front arc bright,
            back arc dimmer) so it reads as passing behind the planet. */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '62vmin',
            height: '17vmin',
            minWidth: 360,
            minHeight: 100,
            transform: 'translate(-50%, -50%) rotate(-18deg)',
            border: '1.5px solid rgba(212,180,131,0.55)',
            boxShadow: '0 0 24px rgba(212,180,131,0.2)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '62vmin',
            height: '17vmin',
            minWidth: 360,
            minHeight: 100,
            transform: 'translate(-50%, -50%) rotate(-18deg) scale(0.94)',
            border: '1px solid rgba(212,180,131,0.18)',
          }}
        />

        {STONES.map((s, i) => (
          <Stone key={i} {...s} />
        ))}
      </motion.div>
    </div>
  )
}
