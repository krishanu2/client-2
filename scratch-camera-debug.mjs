import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

await page.goto('https://client-2-zeta.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(14000)

const info = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  const viewport = gl ? gl.getParameter(gl.VIEWPORT) : null
  const scissorBox = gl ? gl.getParameter(gl.SCISSOR_BOX) : null
  return {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    canvasCSSWidth: canvas.getBoundingClientRect().width,
    devicePixelRatio: window.devicePixelRatio,
    glViewport: viewport ? Array.from(viewport) : null,
    glScissor: scissorBox ? Array.from(scissorBox) : null,
    glDrawingBufferWidth: gl ? gl.drawingBufferWidth : null,
    glDrawingBufferHeight: gl ? gl.drawingBufferHeight : null,
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
