/**
 * The experience is a Three.js/WebGL canvas-driven journey, which leaves
 * search crawlers almost nothing to read. This block renders real,
 * semantic, crawlable text — visually hidden (sr-only) but always in the
 * DOM regardless of which stage/Act is currently mounted — so Google (and
 * screen readers landing before Act 2's Nav exists) get an accurate
 * description of who Karnjeet is and what he offers.
 */
export default function SEOContent() {
  return (
    <div className="sr-only">
      <h1>Karnjeet Vinod — Online Fitness &amp; Mindset Coach (@thegr8nessguy)</h1>
      <p>
        Melbourne-based online coach helping clients rebuild their body, mind, and
        sense of self through personalised training, mindset coaching, and the
        GR8NESS philosophy.
      </p>

      <h2>About Karnjeet</h2>
      <p>
        Melbourne-based, self-taught, and obsessed with the process. Karnjeet didn&rsquo;t
        start as a coach — he started as someone who needed to change his own life first.
        GR8NESS isn&rsquo;t a brand he built. It&rsquo;s the person he had to become.
      </p>

      <h2>Body — Physique Coaching</h2>
      <p>
        Individualised training programming, weekly check-ins, and physique
        development built around your life, not a generic template.
      </p>

      <h2>Mind — Mindset Coaching</h2>
      <p>
        Pattern breaking, identity work, and weekly mindset calls for people who
        already know what to do and still don&rsquo;t do it.
      </p>

      <h2>Soul — The GR8NESS Philosophy</h2>
      <p>The spiritual foundation underneath the training and the mindset work.</p>

      <h2>Client Results</h2>
      <ul>
        <li>
          Radhika (@radhikapahujak5): lost 13kg in 16 weeks, Melbourne — from
          underconfident and restrictive eating to feeling her best.
        </li>
        <li>Harshini (@harshini_ramesh96): 16-week transformation while working a 9-5.</li>
        <li>24-week client transformation: 49kg to 54kg of lean muscle on a full-time job.</li>
      </ul>

      <h2>Get Coached</h2>
      <p>
        Book a discovery call to start a conversation, or DM the word GR8NESS on
        Instagram. @thegr8nessguy — Melbourne, Australia.
      </p>
    </div>
  )
}
