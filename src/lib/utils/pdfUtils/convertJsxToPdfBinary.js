'use server'

import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer'

import templateStyles from '@/templates/templateStyles'
const { renderToString } = await import('react-dom/server')

export default async function convertJsxToPdfBinary(
  jsxContent,
  { title = '' }
) {
  const executablePath = await chromium.executablePath()

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  })
  const page = await browser.newPage()
  await page.setContent(`<html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
      <title>${title}</title>
      <style>${templateStyles}</style>
    </head>
    <body>
      ${renderToString(jsxContent)}
    </body>
  </html>`)
  const pdfBuffer = await page.pdf({
    format: 'A4',
    displayHeaderFooter: true,

    footerTemplate: `<div style="font-size: 10px; width: 100%; display: flex; justify-content: end; padding: 0 16px;">
                         <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
                       </div>`,
  })
  await browser.close()
  return pdfBuffer
}
