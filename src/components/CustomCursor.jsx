import { useEffect, useRef } from 'react'
import { COLORS } from '@/lib/theme'

const LAG = 0.18 // lower = more lag behind the real pointer
const TRAIL_LENGTH = 14
const ORB_RADIUS = 7
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select'

// Per-section accent — the cursor picks up each section's own color as
// you move through it, so it reads as one system tracking your attention
// through the story rather than a fixed decoration.
const SECTION_ACCENTS = {
  about: COLORS.violet,
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Replaces the system cursor with a glowing ember orb that trails a short
 * light streak behind it. Disabled entirely on touch/coarse-pointer devices
 * (index.css also re-enables the native cursor there via a media query).
 * Grows and brightens over interactive elements — one consistent
 * "this is clickable" signal site-wide, backstopping the Act3/Act4
 * discoverability hints rather than relying on them alone.
 */
export default function CustomCursor() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const isCoarsePointer = window.matchMedia(
      '(hover: none), (pointer: coarse)'
    ).matches
    if (isCoarsePointer) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pointer = { x: width / 2, y: height / 2 }
    const orb = { x: pointer.x, y: pointer.y }
    const trail = []
    let visible = false
    let interactive = false
    let scale = 1
    let accent = COLORS.ember

    const handleMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      visible = true
      const section = e.target.closest?.('section[id]')
      accent = (section && SECTION_ACCENTS[section.id]) || COLORS.ember
    }
    const handleLeave = () => {
      visible = false
    }
    const handleOver = (e) => {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) interactive = true
    }
    const handleOut = (e) => {
      if (e.target.closest?.(INTERACTIVE_SELECTOR)) interactive = false
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mouseenter', handleMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    const draw = () => {
      orb.x += (pointer.x - orb.x) * LAG
      orb.y += (pointer.y - orb.y) * LAG
      scale += ((interactive ? 1.7 : 1) - scale) * 0.18

      trail.push({ x: orb.x, y: orb.y })
      if (trail.length > TRAIL_LENGTH) trail.shift()

      ctx.clearRect(0, 0, width, height)

      if (visible) {
        const [r, g, b] = hexToRgb(accent)
        trail.forEach((point, i) => {
          const t = i / trail.length
          const radius = ORB_RADIUS * 0.5 * t * scale
          if (radius <= 0) return
          ctx.beginPath()
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${t * 0.25})`
          ctx.fill()
        })

        const glowRadius = ORB_RADIUS * 4 * scale
        const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, glowRadius)
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${interactive ? 0.7 : 0.55})`)
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, ORB_RADIUS * scale, 0, Math.PI * 2)
        ctx.fillStyle = interactive ? COLORS.offwhite : accent
        ctx.shadowColor = accent
        ctx.shadowBlur = interactive ? 18 : 12
        ctx.fill()
        ctx.shadowBlur = 0
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mouseenter', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] hidden sm:block"
      aria-hidden="true"
    />
  )
}
