'use client'

import { Box, Button, CircularProgress, Paper } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import routes from '@/constants/routeConstants'
import handleServerAction from '@/lib/handleServerAction'
import useFetchAndShare from '@/lib/utils/pdfUtils/useFetchAndShare'
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

  const {
    share,
    isPending: isSharePending,
    canShare,
  } = useFetchAndShare(
    routes.salesOrder.viewPDF(stockCycleId, salesOrderNumber),
    { title: `Sales Order ${salesOrderNumber}` }
  )

  return (
    <>
      <Paper className='overflow-auto h-full flex flex-col p-4 print:hidden'>
        {isSalesOrderLoading ? (
          <CircularProgress size={24} color='action' />
        ) : (
          <ErrorAlert isError={isSalesOrderError} error={salesOrderError}>
            <Box className='flex gap-2'>
              <Button
                className='rounded-3xl mb-4'
                variant='outlined'
                LinkComponent={Link}
                href={routes.salesOrder.edit(stockCycleId, salesOrderNumber)}>
                Edit Sales Order
              </Button>
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
                disabled={!canShare}
                onClick={share}
                loading={isSharePending}>
                Share PDF
              </Button>
            </Box>
            <Box></Box>
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
