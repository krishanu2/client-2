import { motion } from 'framer-motion'
import { playUITick } from '@/lib/audioEngine'

const LINKS = [
  { label: 'Method', href: '#method' },
  { label: 'About', href: '#about' },
  { label: 'Proof', href: '#proof' },
  { label: 'Grind', href: '#grind' },
  { label: 'Start', href: '#call' },
]

/**
 * Minimal top-right nav. Appears for the first time once Act 2 completes
 * (PRD: "Navigation appears for the first time"). Scroll target IDs match
 * each Act's section id so Lenis can smooth-scroll to them.
 */
export default function Nav({ lenisRef }) {
  const handleClick = (e, href) => {
    e.preventDefault()
    playUITick('click')
    const target = document.querySelector(href)
    if (!target) return
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(target, { offset: 0 })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-3 top-4 z-50 flex gap-2 sm:right-10 sm:top-8 sm:gap-6"
    >
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleClick(e, link.href)}
          onMouseEnter={() => playUITick('hover')}
          className="whitespace-nowrap font-heading text-[8px] font-bold uppercase tracking-[0.05em] text-offwhite/70 transition-colors hover:text-ember sm:text-[11px] sm:tracking-[0.25em]"
        >
          {link.label}
        </a>
      ))}
    </motion.nav>
  )
}
