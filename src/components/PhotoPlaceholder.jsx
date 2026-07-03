/**
 * Stands in for real photography until assets arrive from Karnjeet
 * (PRD section 12 risk mitigation: "use silhouettes or motion blur as
 * placeholder"). Pass `src` once the real asset exists — everything else
 * (aspect, rounding, label) stays the same so swapping in real photos
 * later is a one-line change per usage site.
 */
export default function PhotoPlaceholder({
  src,
  alt = '',
  label,
  className = '',
  variant = 'portrait', // 'portrait' | 'wide'
  style,
}) {
  if (src) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} style={style} />
  }

  return (
    <div
      className={`relative flex items-end overflow-hidden bg-gradient-to-br from-ash via-void to-black ${className}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            variant === 'wide'
              ? 'radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(255,107,53,0.25), transparent 55%)'
              : 'radial-gradient(circle at 50% 32%, rgba(255,107,53,0.28), transparent 55%), radial-gradient(circle at 50% 78%, rgba(139,92,246,0.3), transparent 60%)',
          filter: 'blur(18px)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      {label && (
        <p className="relative z-10 w-full px-4 pb-3 font-body text-[10px] uppercase tracking-[0.2em] text-offwhite/40">
          {label}
        </p>
      )}
    </div>
  )
}
