/**
 * Generates target points for the Act 2 particle-face materialisation by
 * sampling a drawn head-and-shoulders silhouette. This is a placeholder
 * shape standing in for a real pre-processed particle map of Karnjeet's
 * photo (PRD section 12: "Client photos unavailable -> use silhouettes...
 * as placeholder until assets arrive"). Swap in an actual photo-sampling
 * pass once his headshot is supplied.
 */
export function getSilhouettePoints(count) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#fff'
  // Head
  ctx.beginPath()
  ctx.ellipse(size * 0.5, size * 0.36, size * 0.16, size * 0.19, 0, 0, Math.PI * 2)
  ctx.fill()
  // Neck
  ctx.fillRect(size * 0.44, size * 0.5, size * 0.12, size * 0.08)
  // Shoulders
  ctx.beginPath()
  ctx.moveTo(size * 0.18, size * 1.0)
  ctx.quadraticCurveTo(size * 0.22, size * 0.62, size * 0.5, size * 0.58)
  ctx.quadraticCurveTo(size * 0.78, size * 0.62, size * 0.82, size * 1.0)
  ctx.closePath()
  ctx.fill()

  const { data } = ctx.getImageData(0, 0, size, size)
  const candidates = []
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const alpha = data[(y * size + x) * 4 + 3]
      if (alpha > 128) candidates.push({ x, y })
    }
  }

  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const p = candidates[Math.floor(Math.random() * candidates.length)]
    const nx = (p.x / size - 0.5) * 2.6
    const ny = -(p.y / size - 0.5) * 2.6
    const nz = (Math.random() - 0.5) * 0.15
    points[i * 3] = nx
    points[i * 3 + 1] = ny
    points[i * 3 + 2] = nz
  }
  return points
}
