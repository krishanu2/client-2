import { motion } from 'framer-motion'

// Four hairline corner brackets, fixed to the viewport for the whole
// experience — a precision-instrument/HUD cue that reads as considered
// and futuristic rather than empty, without adding motion or competing
// with any section's own content. Static once faded in; the only "loop"
// here is none at all.
const CORNERS = [
  { top: true, left: true },
  { top: true, left: false },
  { top: false, left: true },
  { top: false, left: false },
]

export default function FrameCorners() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {CORNERS.map((c, i) => (
        <motion.svg
          key={i}
          width="28"
          height="28"
          viewBox="0 0 28 28"
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
          style={{
            top: c.top ? 18 : 'auto',
            bottom: c.top ? 'auto' : 18,
            left: c.left ? 18 : 'auto',
            right: c.left ? 'auto' : 18,
            transform: `scale(${c.left ? 1 : -1}, ${c.top ? 1 : -1})`,
          }}
        >
          <path
            d="M1 10 V1 H10"
            fill="none"
            stroke="var(--color-ember)"
            strokeWidth="1"
          />
        </motion.svg>
      ))}
    </div>
  )
}
