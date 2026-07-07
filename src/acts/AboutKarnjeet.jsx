import { motion } from 'framer-motion'
import useSectionView from '@/lib/useSectionView'

// Spoken in two breaths, not printed in one block — each clause holds
// before the next arrives, so the line reads as something said to you
// rather than a quote-card graphic.
const THESIS_CLAUSES = ['“GR8NESS isn’t a brand I built.', 'It’s the person I had to become.”']

/**
 * A dedicated introduction to Karnjeet as a person — inserted between
 * Method (the "how") and Proof (the results), because the persuasion arc
 * had a gap: visitors met his philosophy and his clients' results, but
 * never actually met *him*. Real photos as of this pass; bio copy below
 * is a draft in his established voice pending his own words/approval.
 */
export default function AboutKarnjeet() {
  useSectionView('about')

  return (
    <section id="about" className="isolate relative w-full overflow-hidden py-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(139,92,246,0.18), transparent 55%)',
        }}
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 lg:order-1"
        >
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">
            Chapter Two
          </p>
          <p className="mb-4 mt-1 font-body text-sm italic text-offwhite/40">
            You just met the method. Now meet the man who built it by living it first.
          </p>
          <p className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.3em] text-ember">
            The Man Behind GR8NESS
          </p>
          <h2 className="font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
            I&rsquo;m Karnjeet.
          </h2>

          <div className="mt-8 space-y-4 font-body text-lg text-offwhite/75">
            <p>
              Melbourne-based, self-taught, and genuinely obsessed with the process. I didn&rsquo;t
              start as a coach — I started as someone who needed to change his own life first.
            </p>
            <p>
              Everything I teach now, I lived through first: the early mornings, the discipline,
              the mindset shifts that actually stick when everything in you wants to quit.
            </p>
          </div>

          <p className="mt-8 font-heading text-sm uppercase tracking-[0.2em] text-offwhite/50">
            @thegr8nessguy — Melbourne, Australia 🇦🇺
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="order-1 grid grid-cols-2 gap-4 lg:order-2"
        >
          <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
            <motion.img
              src="/images/karnjeet-candid.jpeg"
              alt="Karnjeet Vinod, candid portrait"
              className="h-full w-full object-cover"
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-transparent to-transparent" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
            <motion.img
              src="/images/karnjeet-lifestyle.jpeg"
              alt="Karnjeet Vinod, Melbourne at night"
              className="h-full w-full object-cover"
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* The thesis line, alone — this is the trust hinge of the whole
          site, the moment "a guy on a website" becomes "someone I
          believe." No ornament competing with it, no ember-orange (that's
          the site's CTA/energy color, wrong register for a confession) —
          just the two clauses arriving one breath apart, and his name
          under it so it reads as him speaking, not a quote-card. */}
      <div className="isolate relative mt-32 flex min-h-[70vh] w-full flex-col items-center justify-center px-6">
        <p className="max-w-3xl text-center font-accent-italic text-3xl leading-snug text-offwhite text-glow-soft sm:text-5xl">
          {THESIS_CLAUSES.map((clause, i) => (
            <motion.span
              key={clause}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 1.1, delay: i * 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {clause}
            </motion.span>
          ))}
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.8, delay: THESIS_CLAUSES.length * 1.2 + 0.2 }}
          className="mt-6 font-heading text-xs uppercase tracking-[0.3em] text-offwhite/40"
        >
          — Karnjeet
        </motion.p>
      </div>
    </section>
  )
}
