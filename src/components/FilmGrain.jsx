// A static noise texture, not an animated one — flickering grain would be
// exactly the ambient-motion-with-no-trigger pattern just removed
// elsewhere. This is pure texture: it sits still and reads as the "film"
// the whole site is shot on, the same way a printed page has paper grain.
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' />
    <feColorMatrix type='saturate' values='0' />
  </filter>
  <rect width='100%' height='100%' filter='url(#n)' />
</svg>`

const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`

export default function FilmGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        backgroundImage: GRAIN_URL,
        backgroundSize: '180px 180px',
        opacity: 0.035,
        mixBlendMode: 'overlay',
      }}
    />
  )
}
