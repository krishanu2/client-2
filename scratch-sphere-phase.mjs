import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

await page.goto('https://client-2-zeta.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(14000)
await page.screenshot({ path: 'scratch-live-sphere2.png', timeout: 60000 })

const info = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  const enterBtn = Array.from(document.querySelectorAll('button')).find(b => /enter/i.test(b.textContent))
  const skipBtn = Array.from(document.querySelectorAll('button')).find(b => /skip/i.test(b.textContent))
  return {
    innerWidth: window.innerWidth,
    bodyText: document.body.innerText.slice(0, 200),
    canvasRect: canvas ? canvas.getBoundingClientRect().toJSON() : null,
    enterBtnRect: enterBtn ? enterBtn.getBoundingClientRect().toJSON() : null,
    skipBtnRect: skipBtn ? skipBtn.getBoundingClientRect().toJSON() : null,
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
