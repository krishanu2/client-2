import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playUITick } from '@/lib/audioEngine'

const LINKS = [
  { label: 'Method', href: '#method' },
  { label: 'About', href: '#about' },
  { label: 'Proof', href: '#proof' },
  { label: 'Grind', href: '#grind' },
  { label: 'Start', href: '#call' },
]

const SECTION_IDS = ['method', 'about', 'proof', 'grind', 'pricing', 'call']

/**
 * Top-right nav. Appears for the first time once the intro completes.
 * Scroll target IDs match each Act's section id so Lenis can smooth-
 * scroll to them. Tracks which section is currently in view (a thin
 * detection band near vertical center of the viewport) and ignites that
 * link in ember, so the nav reflects where you actually are in the story.
 * Below `sm`, the inline row is replaced by a single toggle that opens a
 * full-screen menu — five cramped shrunk labels never actually worked as
 * a real mobile nav.
 */
export default function Nav({ lenisRef }) {
  const [active, setActive] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleClick = (e, href) => {
    e.preventDefault()
    playUITick('click')
    setMobileOpen(false)
    const target = document.querySelector(href)
    if (!target) return
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(target, { offset: 0 })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const linkClass = (link) => {
    const isPrimary = link.label === 'Start'
    const isActive = active === link.href.slice(1)
    if (isPrimary) {
      // Ghost/outline, not a filled pill — a solid orange block read as
      // too loud next to the plain-text links beside it. Fills solid on
      // hover so the interaction still has a satisfying "commit" moment.
      return 'whitespace-nowrap rounded-full border border-ember/50 bg-transparent px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-ember transition-colors duration-300 hover:bg-ember hover:text-void'
    }
    return `whitespace-nowrap font-heading text-[11px] font-bold uppercase tracking-[0.25em] transition-colors hover:text-ember ${
      isActive ? 'text-ember text-glow-ember' : 'text-offwhite/70'
    }`
  }

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-4 top-4 z-50 hidden items-center gap-6 rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 backdrop-blur-xl sm:right-10 sm:top-8 sm:flex"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)' }}
      >
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={(e) => handleClick(e, link.href)} onMouseEnter={() => playUITick('hover')} className={linkClass(link)}>
            {link.label}
          </a>
        ))}
      </motion.nav>

      {/* Mobile: a single toggle instead of five shrunk labels */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed right-4 top-4 z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-white/15 bg-black/30 backdrop-blur-sm sm:hidden"
      >
        <span className="h-[1.5px] w-4 bg-offwhite" />
        <span className="h-[1.5px] w-4 bg-offwhite" />
      </motion.button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-void/98 backdrop-blur-md sm:hidden"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-5 top-5 font-heading text-xs uppercase tracking-[0.2em] text-offwhite/60"
            >
              Close ✕
            </button>
            {LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`font-display text-4xl ${
                  active === link.href.slice(1) ? 'text-ember' : 'text-offwhite'
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
