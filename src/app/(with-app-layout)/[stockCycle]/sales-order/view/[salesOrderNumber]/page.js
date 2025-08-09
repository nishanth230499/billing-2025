'use client'

import { Box, Button, CircularProgress, Paper } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getSalesOrderAction } from '@/actions/salesOrderActions'
import ErrorAlert from '@/components/common/ErrorAlert'
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
                href={`/${stockCycleId}/sales-order/view/${salesOrderNumber}/pdf`}
                target='_blank'>
                View PDF
              </Button>
            </Box>
            <SalesOrderTemplate salesOrder={salesOrderResponse} />
          </ErrorAlert>
        )}
      </Paper>
      <Box className='hidden print:block'>
        {!isSalesOrderLoading && !isSalesOrderError && (
          <SalesOrderTemplate salesOrder={salesOrderResponse} />
        )}
      </Box>
    </>
  )
}
