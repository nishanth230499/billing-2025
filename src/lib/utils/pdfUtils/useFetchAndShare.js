'use client'

import { useMutation } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack'
import { useCallback } from 'react'

export default function useFetchAndShare(url, { title = 'Document' }) {
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => fetch(data),
  })

  const share = useCallback(() => {
    if (!navigator.canShare) {
      enqueueSnackbar('File sharing is not supported!', { variant: 'error' })
      console.error('File sharing is not supported!')
      return
    }

    mutate(url, {
      onSuccess: async (response) => {
        if (!response.ok) {
          enqueueSnackbar('Failed to fetch PDF.', { variant: 'error' })
          console.error('Failed to fetch PDF:', response.statusText)
          return
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('pdf')) {
          enqueueSnackbar('Response is not a PDF.', { variant: 'error' })
          console.error('Response is not a PDF:', contentType)
          return
        }

        const pdfBuffer = await response.arrayBuffer()
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
        const pdfFile = new File([pdfBlob], `${title}.pdf`, {
          type: 'application/pdf',
          lastModified: Date.now(),
        })

        if (!navigator.canShare({ files: [pdfFile] })) {
          enqueueSnackbar('File sharing is not supported!', {
            variant: 'error',
          })
          console.error('File sharing is not supported!')
          return
        }

        navigator.share({
          files: [pdfFile],
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
        console.error(error)
      },
    })
  }, [mutate, title, url])
  return { share, isPending }
}

// export default async function convertPdfUrlToPdfFileAndShare(
//   url,
//   { title = '' }
// ) {
//   try {
//     if (!navigator.canShare) {
//       enqueueSnackbar('File sharing is not supported!', { variant: 'error' })
//       console.error('File sharing is not supported!')
//       return
//     }

//     const response = await fetch(url)

//     if (!response.ok) {
//       enqueueSnackbar('Failed to fetch PDF.', { variant: 'error' })
//       console.error('Failed to fetch PDF:', response.statusText)
//       return
//     }

//     const contentType = response.headers.get('content-type') || ''
//     if (!contentType.includes('pdf')) {
//       enqueueSnackbar('Response is not a PDF.', { variant: 'error' })
//       console.error('Response is not a PDF:', contentType)
//       return
//     }

//     const pdfBuffer = await response.arrayBuffer()
//     const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
//     const pdfFile = new File([pdfBlob], `${title}.pdf`, {
//       type: 'application/pdf',
//       lastModified: Date.now(),
//     })

//     if (!navigator.canShare({ files: [pdfFile] })) {
//       enqueueSnackbar('File sharing is not supported!', { variant: 'error' })
//       console.error('File sharing is not supported!')
//       return
//     }

//     navigator.share({
//       files: [pdfFile],
//     })
//   } catch (error) {
//     enqueueSnackbar(error.message, { variant: 'error' })
//     console.error(error)
//   }
// }
