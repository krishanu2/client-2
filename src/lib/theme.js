/**
 * THE BECOMING — shared design tokens.
 * Tailwind reads these as classes (bg-void, text-ember, ...) via the
 * @theme block in src/index.css. Three.js / GLSL / canvas code can't
 * consume CSS custom properties directly, so the same values live here
 * as plain JS for use in shaders, materials, and canvas drawing.
 */

export const COLORS = {
  void: '#0C0C1D',
  ember: '#D4B483',
  offwhite: '#E8E8E8',
  violet: '#8B5CF6',
  ash: '#3A3A4A',
}

export const FONTS = {
  display: '"Clash Display", "Syne", sans-serif',
  heading: '"Syne", sans-serif',
  body: '"DM Sans", sans-serif',
  accent: '"Playfair Display", serif',
}

export const EASE_BECOMING = [0.16, 1, 0.3, 1]

/** Shared timing tiers so hand-tuned durations don't drift per-file. */
export const DURATION = {
  micro: 0.15, // hover/press feedback
  base: 0.6, // standard reveals
  slow: 2.2, // hero-scale entrances (sphere reveal, panel titles)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const supportsWebGL = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * One-shot device-capability probe: samples the first `sampleFrames`
 * requestAnimationFrame deltas and resolves to 'high' | 'medium' | 'low'.
 * Deliberately a single measurement at mount, not a live monitor — the
 * plan calls for no mid-animation quality renegotiation (avoids
 * flicker/thrash from threshold flapping).
 */
export function probeDeviceCapability({ sampleFrames = 20 } = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || prefersReducedMotion()) {
      resolve('medium')
      return
    }
    const deltas = []
    let last = performance.now()
    let frame = 0

    function tick(now) {
      deltas.push(now - last)
      last = now
      frame += 1
      if (frame < sampleFrames) {
        requestAnimationFrame(tick)
        return
      }
      const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
      // ~16.7ms/frame = 60fps, ~33ms = 30fps
      if (avg <= 20) resolve('high')
      else if (avg <= 40) resolve('medium')
      else resolve('low')
    }
    requestAnimationFrame(tick)
  })
}
