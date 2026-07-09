import { motion } from 'framer-motion'
import useSectionView from '@/lib/useSectionView'

// Real client results with real Instagram handles — from the original
// brief, previously only surfaced to search crawlers (SEOContent.jsx)
// and never actually shown to a visitor. No invented name for the third
// client since none was given; "Client — Melbourne" matches how the
// unnamed Proof testimonial is labeled, rather than fabricating one.
const RESULTS = [
  {
    stat: '-13kg',
    timeframe: '16 weeks',
    name: 'Radhika',
    handle: 'radhikapahujak5',
    context: 'From underconfident and restrictive eating to feeling her best.',
  },
  {
    stat: '16 weeks',
    timeframe: 'Full transformation',
    name: 'Harshini',
    handle: 'harshini_ramesh96',
    context: 'Transformed while working a full-time 9-5 — no excuses, just the work.',
  },
  {
    stat: '49 → 54kg',
    timeframe: '24 weeks',
    name: 'Client',
    handle: null,
    context: 'Lean muscle gained on a full-time job. Still training, still becoming.',
  },
]

export default function Act5Results() {
  useSectionView('results')

  return (
    <section id="results" className="isolate relative w-full overflow-hidden px-6 py-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(212,180,131,0.08), transparent 60%)' }}
      />

      <p className="text-center font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-ember/60">
        Chapter Four
      </p>
      <p className="mx-auto mb-2 mt-1 max-w-md text-center font-body text-sm italic text-offwhite/40">
        Not photos this time — names, handles, and numbers you can go verify yourself.
      </p>
      <h2 className="mb-16 mt-3 text-center font-display text-4xl font-extrabold text-offwhite sm:text-5xl">
        The Results
      </h2>

      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
        {RESULTS.map((r, i) => (
          <motion.div
            key={r.name + i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card flex flex-col p-8"
          >
            <p className="font-display text-4xl font-extrabold text-ember sm:text-5xl">{r.stat}</p>
            <p className="mt-1 font-heading text-xs uppercase tracking-[0.25em] text-offwhite/40">
              {r.timeframe}
            </p>

            <p className="mt-6 flex-1 font-body text-sm leading-relaxed text-offwhite/75">
              {r.context}
            </p>

            <div className="mt-8 border-t border-white/10 pt-4">
              <p className="font-heading text-sm font-bold uppercase tracking-[0.15em] text-offwhite">
                {r.name}
              </p>
              {r.handle ? (
                <a
                  href={`https://instagram.com/${r.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-body text-xs text-ember/80 underline decoration-ember/30 underline-offset-4 hover:text-ember"
                >
                  @{r.handle}
                </a>
              ) : (
                <p className="mt-1 font-body text-xs text-offwhite/40">Melbourne, Australia</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
