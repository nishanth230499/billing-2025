export default async function convertPdfUrlToPdfFile(url, { title = '' }) {
  const response = await fetch(url)

  if (!response.ok) {
    console.error('Failed to fetch PDF:', response.statusText)
    throw new Error('Failed to fetch PDF.')
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('pdf')) {
    console.error('Response is not a PDF:', contentType)
    throw new Error('Response is not a PDF.')
  }

  const pdfBuffer = await response.arrayBuffer()
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
  const pdfFile = new File([pdfBlob], `${title}.pdf`, {
    type: 'application/pdf',
    lastModified: Date.now(),
  })

  return pdfFile
}
