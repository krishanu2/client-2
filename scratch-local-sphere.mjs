import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(14000)
await page.screenshot({ path: 'scratch-local-sphere.png', timeout: 60000 })

const info = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  return {
    canvasRect: canvas ? canvas.getBoundingClientRect().toJSON() : null,
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
