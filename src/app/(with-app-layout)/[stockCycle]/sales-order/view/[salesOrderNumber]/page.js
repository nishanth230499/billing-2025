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
    const pdfBlob = await response.blob()

    const file = new File([pdfBlob], `Sales Order ${salesOrderNumber}.pdf`, {
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
