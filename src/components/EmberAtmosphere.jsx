import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 22

/**
 * A sparse layer of embers fixed to the viewport across the whole main
 * experience — not per-section decoration, one continuous atmosphere so
 * the scroll reads as one space rather than six separately-decorated
 * rooms. Canvas2D only (no WebGL — that constraint stays reserved for
 * the Gate's single <Canvas>).
 *
 * Classy over busy: this used to drift every frame forever, even while
 * the visitor sat still reading. Now the particles only advance while
 * the page is actively scrolling — motion as a response to the visitor,
 * not ambient wallpaper running whether anyone's moving or not.
 */
export default function EmberAtmosphere() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let raf

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.6 + Math.random() * 1.4,
      speed: 6 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 8,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.25,
    }))

    let isScrolling = false
    let scrollStopTimer
    const handleScroll = () => {
      isScrolling = true
      clearTimeout(scrollStopTimer)
      scrollStopTimer = setTimeout(() => {
        isScrolling = false
      }, 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    let last = performance.now()
    const draw = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05)
      last = time
      // Frozen unless actively scrolling — the last-drawn frame just sits
      // there untouched, so stillness on the page reads as stillness on
      // screen, not a canvas quietly animating regardless.
      if (isScrolling) {
        const w = window.innerWidth
        const h = window.innerHeight
        ctx.clearRect(0, 0, w, h)
        particles.forEach((p) => {
          p.y -= p.speed * dt
          p.x += Math.sin(time * 0.0006 + p.phase) * p.drift * dt
          if (p.y < -10) {
            p.y = h + 10
            p.x = Math.random() * w
          }
          const twinkle = 0.35 + 0.35 * Math.sin(time * 0.0015 + p.phase)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.warm
            ? `rgba(255,140,80,${twinkle * 0.5})`
            : `rgba(232,232,232,${twinkle * 0.25})`
          ctx.fill()
        })
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(scrollStopTimer)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
