import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PhotoPlaceholder from '@/components/PhotoPlaceholder'
import { playUITick } from '@/lib/audioEngine'
import { trackEvent } from '@/lib/analytics'

/**
 * A single transformation polaroid. Desktop: draggable within the section
 * (`dragConstraints`) like a real photo nudged around a desk — it does NOT
 * spring back to its exact origin (a prior `animate={{x:0,y:0}}` implied it
 * would, but Framer Motion doesn't re-trigger `animate` for an unchanged
 * target after a drag repositions the underlying motion values, so cards
 * were staying wherever dropped, unconstrained, and could end up off-
 * section). Both desktop and the mobile carousel share the same
 * flip-to-reveal-testimonial interaction. Framer Motion still fires
 * onClick for a plain tap even when `drag` is enabled — only an actual
 * drag gesture suppresses it.
 */
export default function PolaroidCard({
  card,
  draggable = true,
  style,
  index = 0,
  containerRef,
  peekOnMount = false,
}) {
  const [flipped, setFlipped] = useState(false)
  const [peeking, setPeeking] = useState(false)

  const handleClick = () => {
    playUITick('flip')
    setFlipped((f) => {
      if (!f) trackEvent('polaroid_flip', { name: card.name })
      return !f
    })
  }

  // Teaches the flip gesture once, on the first card, right after its
  // entrance settles — otherwise the testimonial text (the actual point
  // of this Act) is gated behind an undiscovered interaction.
  useEffect(() => {
    if (!peekOnMount) return undefined
    const start = setTimeout(() => setPeeking(true), 900)
    const end = setTimeout(() => setPeeking(false), 1500)
    return () => {
      clearTimeout(start)
      clearTimeout(end)
    }
  }, [peekOnMount])

  return (
    <motion.div
      className="relative h-72 w-56 shrink-0 sm:h-80 sm:w-64"
      style={{ perspective: 1200, ...style }}
      role="button"
      tabIndex={0}
      aria-label={`Flip ${card.name ?? 'client'} photo to read testimonial`}
      drag={draggable}
      dragConstraints={containerRef}
      dragElastic={0.18}
      dragMomentum={false}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.03 }}
      initial={{ opacity: 0, y: 36, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : peeking ? -18 : 0 }}
        transition={{ duration: peeking ? 0.5 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col rounded-sm bg-offwhite p-3 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <PhotoPlaceholder
            alt={card.name ? `${card.name} transformation` : 'Client transformation'}
            label={card.photoLabel}
            className="h-[85%] w-full rounded-[1px]"
          />
          <p className="mt-2 text-center font-heading text-xs font-bold uppercase tracking-wide text-void">
            {card.name ?? 'Client'}
          </p>
        </div>

        {/* Back */}
        <div
          className="glass-card absolute inset-0 flex flex-col justify-center rounded-sm p-5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {card.stat && (
            <motion.p
              animate={{ scale: flipped ? 1 : 0.5, opacity: flipped ? 1 : 0 }}
              transition={{ delay: flipped ? 0.35 : 0, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="font-display text-4xl font-extrabold text-ember"
            >
              {card.stat}
            </motion.p>
          )}
          {card.context && (
            <p className="mt-1 font-heading text-[11px] uppercase tracking-wide text-offwhite/50">
              {card.context}
            </p>
          )}
          <p className="mt-3 font-body text-sm leading-relaxed text-offwhite">{card.testimonial}</p>
          {card.handle && (
            <p className="mt-4 font-heading text-xs font-bold uppercase tracking-wider text-ember">
              {card.handle}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
