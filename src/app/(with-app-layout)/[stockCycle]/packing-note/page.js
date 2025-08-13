'use client'

import { Box, CircularProgress, Grid, Paper } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'

import { getCustomerAction } from '@/actions/customerActions'
import { getPackingNoteAction } from '@/actions/packingNoteActions'
import { AppContext } from '@/app/ClientProviders'
import ErrorAlert from '@/components/common/ErrorAlert'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import CustomerShippingAddressSelector from '@/components/common/selectors/CustomerShippingAddressSelector'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import PackingNoteTemplate from '@/templates/PackingNoteTemplate'

export default function Page() {
  const params = useParams()
  const { searchParams, replaceURL } = useHandleSearchParams()
  const { appConfig } = useContext(AppContext)

  const { IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE } = appConfig
  const stockCycleId = params.stockCycle
  const customerId = useMemo(
    () => searchParams.get('customerId') || '',
    [searchParams]
  )

  const [customerShippingAddressId, setCustomerShippingAddressId] = useState('')

  const {
    data: customerResponse,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomerAction, customerId, stockCycleId),
    queryKey: ['getCustomerAction', customerId, stockCycleId],
    enabled: Boolean(customerId) && Boolean(stockCycleId),
  })

  const {
    data: packingNoteResponse,
    isLoading: isPackingNoteLoading,
    isError: isPackingNoteError,
    error: packingNoteError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getPackingNoteAction, {
        stockCycleId,
        customerId,
      }),
    queryKey: ['getPackingNoteAction', stockCycleId, customerId],
    enabled: Boolean(stockCycleId && customerId),
  })

  useEffect(() => {
    if (customerId) {
      setCustomerShippingAddressId('')
    } else {
      setCustomerShippingAddressId('')
    }
  }, [customerId])

  return (
    <>
      <Paper className='overflow-auto h-full flex flex-col p-4 print:hidden'>
        {isPackingNoteLoading ? (
          <CircularProgress size={24} color='action' />
        ) : (
          <ErrorAlert isError={isPackingNoteError} error={packingNoteError}>
            <Grid
              container
              columnSpacing={2}
              columns={{ xs: 1, sm: 3 }}
              className='mb-2'
              alignItems='center'>
              <Grid size={1}>
                <ErrorAlert isError={isCustomerError} error={customerError}>
                  <CustomerSelector
                    selectedCustomerId={customerId}
                    setSelectedCustomerId={(id) => {
                      replaceURL({ customerId: id || undefined })
                    }}
                    filter={
                      IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
                        ? { stockCycle: { id: stockCycleId } }
                        : {}
                    }
                    isLoading={isCustomerLoading}
                    customerResponse={customerResponse}
                  />
                </ErrorAlert>
              </Grid>
              <Grid size={1}>
                <CustomerShippingAddressSelector
                  selectedCustomerShippingAddressId={customerShippingAddressId}
                  setSelectedCustomerShippingAddressId={
                    setCustomerShippingAddressId
                  }
                  customerId={customerId}
                  emptyLabel='All'
                />
              </Grid>
            </Grid>
            <PackingNoteTemplate
              customer={customerResponse}
              packingNote={packingNoteResponse}
              stockCycleId={stockCycleId}
            />
          </ErrorAlert>
        )}
      </Paper>
      <Box className='hidden print:block'>
        {!isPackingNoteLoading && !isPackingNoteError && (
          <PackingNoteTemplate
            customer={customerResponse}
            packingNote={packingNoteResponse}
            stockCycleId={stockCycleId}
          />
        )}
      </Box>
    </>
  )
}
