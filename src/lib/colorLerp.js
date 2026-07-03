function hexToRgb(hex) {
  const v = hex.replace('#', '')
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Interpolates through an ordered list of { p (0-1), color } stops. */
export function sampleGradientStops(stops, progress) {
  const p = Math.min(Math.max(progress, 0), 1)
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (p >= a.p && p <= b.p) {
      const localT = (p - a.p) / (b.p - a.p || 1)
      const rgbA = hexToRgb(a.color)
      const rgbB = hexToRgb(b.color)
      const r = Math.round(lerp(rgbA.r, rgbB.r, localT))
      const g = Math.round(lerp(rgbA.g, rgbB.g, localT))
      const bch = Math.round(lerp(rgbA.b, rgbB.b, localT))
      return `rgb(${r}, ${g}, ${bch})`
    }
  }
  return stops[stops.length - 1].color
}
