import { playUITick } from '@/lib/audioEngine'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between sm:py-6">
        <div className="flex items-center gap-3">
          <img
            src="/images/gr8ness-emblem.jpeg"
            alt="GR8NESS"
            className="h-7 w-7 rounded-full border border-ember/30 object-cover"
          />
          <p className="font-display text-lg font-extrabold text-offwhite">GR8NESS</p>
        </div>

        <p className="font-body text-sm text-offwhite/60">@thegr8nessguy</p>

        <a
          href="https://instagram.com/thegr8nessguy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram — @thegr8nessguy"
          onMouseEnter={() => playUITick('hover')}
          className="text-offwhite/70 transition-all duration-200 hover:scale-110 hover:text-ember"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
          </svg>
        </a>
      </div>
      <p className="pb-6 text-center font-body text-xs text-offwhite/30 sm:pb-4">
        © 2026 Karnjeet Vinod. All rights reserved.
      </p>
    </footer>
  )
}
