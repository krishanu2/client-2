/** Lightweight per-section Suspense fallback — a full-screen LoadingScreen
 * repeated for every Act would look broken as the visitor scrolls; this is
 * a quiet placeholder that just reserves the section's height. */
export default function SectionFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-ember/60" />
    </div>
  )
}
