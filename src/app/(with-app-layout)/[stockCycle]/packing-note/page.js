'use client'

import {
  Box,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
} from '@mui/material'
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
  const [selectedOrderRefs, setSelectedOrderRefs] = useState([])
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([])

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
      setCustomerShippingAddressId(undefined)
    } else {
      setCustomerShippingAddressId(undefined)
    }
  }, [customerId])

  useEffect(() => {
    if (packingNoteResponse) {
      setSelectedOrderRefs([])
    } else {
      setSelectedOrderRefs([])
    }
  }, [packingNoteResponse])

  const orderRefs = useMemo(
    () => [
      ...new Set(
        packingNoteResponse?.map((packingNote) => packingNote?.orderRef)
      ),
    ],
    [packingNoteResponse]
  )

  const companies = useMemo(() => {
    const companies = {}
    packingNoteResponse?.forEach((packingNote) => {
      packingNote?.items.forEach(({ item }) => {
        if (!(item?.companyId in companies)) {
          companies[item?.companyId] = item?.company?.name
        }
      })
    })
    return companies
  }, [packingNoteResponse])

  const filteredPackingNote = useMemo(() => {
    let newPackingNotes =
      selectedCompanyIds.length === 0
        ? packingNoteResponse
        : packingNoteResponse
            ?.map((packingNote) => ({
              ...packingNote,
              items: packingNote?.items.filter(({ item }) =>
                selectedCompanyIds.includes(item.companyId)
              ),
            }))
            ?.filter((packingNote) => packingNote.items.length)

    newPackingNotes =
      typeof customerShippingAddressId === 'undefined'
        ? newPackingNotes
        : newPackingNotes?.filter(
            (packingNote) =>
              (packingNote?.customerShippingAddressId ?? '') ===
              customerShippingAddressId
          )

    newPackingNotes =
      selectedOrderRefs.length === 0
        ? newPackingNotes
        : newPackingNotes?.filter((packingNote) =>
            selectedOrderRefs.includes(packingNote?.orderRef)
          )

    return newPackingNotes
  }, [
    customerShippingAddressId,
    packingNoteResponse,
    selectedCompanyIds,
    selectedOrderRefs,
  ])

  const partial = useMemo(
    () =>
      selectedCompanyIds.length ||
      typeof customerShippingAddressId !== 'undefined' ||
      selectedOrderRefs.length,
    [
      customerShippingAddressId,
      selectedCompanyIds.length,
      selectedOrderRefs.length,
    ]
  )

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
                />
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  fullWidth
                  select
                  multiple
                  label='Order Refs'
                  value={selectedOrderRefs}
                  onChange={(e) => setSelectedOrderRefs(e.target.value)}
                  slotProps={{ select: { multiple: true } }}>
                  {orderRefs?.map((orderRef) => (
                    <MenuItem key={orderRef} value={orderRef}>
                      {orderRef || '-'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  fullWidth
                  select
                  multiple
                  label='Companies'
                  value={selectedCompanyIds}
                  onChange={(e) => setSelectedCompanyIds(e.target.value)}
                  slotProps={{ select: { multiple: true } }}>
                  {Object.entries(companies)?.map(
                    ([companyId, companyName]) => (
                      <MenuItem key={companyId} value={companyId}>
                        {companyName}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>
            </Grid>
            <PackingNoteTemplate
              customer={customerResponse}
              packingNote={filteredPackingNote}
              stockCycleId={stockCycleId}
              partial={partial}
            />
          </ErrorAlert>
        )}
      </Paper>
      <Box className='hidden print:block'>
        {!isPackingNoteLoading && !isPackingNoteError && (
          <PackingNoteTemplate
            customer={customerResponse}
            packingNote={filteredPackingNote}
            stockCycleId={stockCycleId}
            partial={partial}
          />
        )}
      </Box>
    </>
  )
}
