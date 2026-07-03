import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('console', (msg) => {
  const text = msg.text()
  if (text.includes('DEBUG_CAMERA')) console.log(text)
})

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(14000)
await page.screenshot({ path: 'scratch-dev-sphere-late.png', timeout: 60000 })

await browser.close()
