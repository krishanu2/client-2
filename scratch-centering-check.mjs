import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()))
page.on('pageerror', (err) => console.log('PAGEERROR:', err.message))

await page.goto('https://client-2-zeta.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(6000)
await page.screenshot({ path: 'scratch-live-sphere.png' })

const info = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  const buttons = Array.from(document.querySelectorAll('button')).map((b) => b.textContent)
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyText: document.body.innerText.slice(0, 300),
    buttons,
    canvasRect: canvas ? canvas.getBoundingClientRect().toJSON() : null,
    canvasAttrWidth: canvas ? canvas.width : null,
    canvasAttrHeight: canvas ? canvas.height : null,
    canvasStyle: canvas ? canvas.getAttribute('style') : null,
    canvasParentRect: canvas && canvas.parentElement ? canvas.parentElement.getBoundingClientRect().toJSON() : null,
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
