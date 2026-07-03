/**
 * On-brand loading fallback shown while an Act's JS chunk (and its Three.js
 * weight) is still downloading. Deliberately CSS-only — no WebGL — so it
 * paints instantly regardless of how much is left to fetch. Visually
 * suggests the cracked sphere assembling from nothing, echoing Act 1.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black">
      <div className="relative h-20 w-20">
        <div
          className="absolute inset-0 animate-[loading-pulse_1.8s_ease-in-out_infinite] rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(255,107,53,0.65), rgba(12,12,29,0.9) 65%)',
            boxShadow: '0 0 40px 8px rgba(255,107,53,0.3)',
          }}
        />
        <div
          className="absolute inset-0 animate-[loading-spin_2.4s_linear_infinite] rounded-full border border-dashed border-ember/40"
        />
      </div>
      <p className="font-heading text-xs uppercase tracking-[0.35em] text-offwhite/50">
        Becoming&hellip;
      </p>

      <style>{`
        @keyframes loading-pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.75; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
