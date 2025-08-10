'use client'

import { Box, Button, CircularProgress, Paper } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import routes from '@/constants/routeConstants'
import handleServerAction from '@/lib/handleServerAction'
import SalesOrderTemplate from '@/templates/SalesOrderTemplate'

export default function Page() {
  const params = useParams()

  const stockCycleId = params.stockCycle
  const salesOrderNumber = params.salesOrderNumber

  const {
    data: salesOrderResponse,
    isLoading: isSalesOrderLoading,
    isError: isSalesOrderError,
    error: salesOrderError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(
        getSalesOrderAction,
        stockCycleId,
        salesOrderNumber
      ),
    queryKey: ['getSalesOrderAction', stockCycleId, salesOrderNumber],
    enabled: Boolean(stockCycleId && salesOrderNumber),
  })

  const handleSharePDF = useCallback(async () => {
    const response = await fetch(
      routes.salesOrder.viewPDF(stockCycleId, salesOrderNumber)
    )

    if (!response.ok) {
      console.error('Failed to fetch PDF:', response.statusText)
      return
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('pdf')) {
      console.error('Response is not a PDF:', contentType)
      return
    }
    console.log('The file is good')
    const pdfBuffer = await response.arrayBuffer()

    // const url = URL.createObjectURL(pdfBlob)
    // const a = document.createElement('a')
    // a.href = url
    // a.download = `Sales Order ${salesOrderNumber}.pdf`
    // document.body.appendChild(a)
    // a.click()
    // a.remove()
    // URL.revokeObjectURL(url)
    const file = new File([pdfBuffer], `Sales_Order_${salesOrderNumber}.pdf`, {
      type: 'application/pdf',
    })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: `Sales Order ${salesOrderNumber}.pdf`,
        text: `Sales Order ${salesOrderNumber}.pdf`,
      })
    } else {
      console.error('File sharing is not supported!')
    }
  }, [salesOrderNumber, stockCycleId])
  return (
    <>
      <Paper className='overflow-auto h-full flex flex-col p-4 print:hidden'>
        {isSalesOrderLoading ? (
          <CircularProgress size={24} color='action' />
        ) : (
          <ErrorAlert isError={isSalesOrderError} error={salesOrderError}>
            <Box>
              <Button
                className='rounded-3xl mb-4'
                variant='outlined'
                LinkComponent={Link}
                href={routes.salesOrder.viewPDF(stockCycleId, salesOrderNumber)}
                target='_blank'>
                View PDF
              </Button>
              <Button
                className='rounded-3xl mb-4'
                variant='outlined'
                onClick={handleSharePDF}>
                Share PDF
              </Button>
            </Box>
            <SalesOrderTemplate
              salesOrder={salesOrderResponse}
              stockCycleId={stockCycleId}
            />
          </ErrorAlert>
        )}
      </Paper>
      <Box className='hidden print:block'>
        {!isSalesOrderLoading && !isSalesOrderError && (
          <SalesOrderTemplate
            salesOrder={salesOrderResponse}
            stockCycleId={stockCycleId}
          />
        )}
      </Box>
    </>
  )
}
