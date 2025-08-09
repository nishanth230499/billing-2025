const { default: puppeteer } = require('puppeteer')
const fsPromises = require('fs/promises')

export async function convertHtmlToPdfBinary(htmlContent, { title = '' }) {
  const cssContent = await fsPromises.readFile(
    './src/templates/template_styles.css',
    'utf8'
  )

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(`<html>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <title>${title}</title>
    <style>${cssContent}</style>
  </head>
  <body>
    ${htmlContent}
  </body>
</html>`)
  const pdfBuffer = await page.pdf({
    format: 'A4',
    displayHeaderFooter: true,

    footerTemplate: `<div style="font-size: 10px; text-align: right; width: 100%; margin-right: 16px;">
                       Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                     </div>`,
  })
  await browser.close()
  return pdfBuffer
}
