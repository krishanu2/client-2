import { motion } from 'framer-motion'
import useSectionView from '@/lib/useSectionView'

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
    <section id="about" className="isolate relative w-full overflow-hidden py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(107, 91, 125,0.18), transparent 55%)',
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
            @thegr8nessguy — Melbourne, Australia
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
          believe." One serif family throughout (Cormorant Garamond,
          Roman + its own italic — no second typeface for emphasis), a
          single unlooped fade-up, and a proper 45/55 editorial grid
          instead of a hard center split. */}
      <div className="isolate relative mt-16 flex min-h-[70vh] w-full items-center overflow-hidden lg:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full py-16 pl-6 pr-6 sm:pl-10 lg:w-[45%] lg:py-0 lg:pl-[120px] lg:pr-12"
        >
          <p
            className="font-quote text-left font-normal text-porcelain text-glow-hairline"
            style={{ fontSize: '60px', lineHeight: 1.2 }}
          >
            <span className="block">Greatness is something</span>
            <span className="mt-6 block">that already exists</span>
            <span className="mt-6 block">
              <motion.em
                className="font-quote-italic"
                initial={{ filter: 'blur(6px)', opacity: 0 }}
                whileInView={{ filter: 'blur(0px)', opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, delay: 0.3 }}
                style={{ display: 'inline-block' }}
              >
                inside all of us.
              </motion.em>
            </span>
          </p>

          <p className="font-quote mt-10 text-left text-[13px] uppercase leading-snug tracking-[0.3em] text-offwhite/60">
            Karnjeet
            <br />
            Founder, GR8NESS
          </p>
        </motion.div>

        {/* Subtle structural divider between text and image — barely
            visible, just enough to read as a considered grid rather than
            two things placed side by side. */}
        <div
          className="absolute top-[20%] hidden h-[60%] w-px lg:block"
          style={{ left: '45%', background: 'rgba(255,255,255,0.08)' }}
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[55%] lg:block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/images/karnjeet-reveal.png"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: '65% 30%', filter: 'grayscale(0.4) brightness(0.75) contrast(1.05)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #0e1020 0%, rgba(14,16,32,0.55) 30%, rgba(14,16,32,0.15) 70%, transparent 100%)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(14,16,32,0.55), transparent 25%, transparent 75%, rgba(14,16,32,0.6))' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
