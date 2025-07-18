'use client'

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  TextField,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'

import { addCustomerAction, getCustomerAction } from '@/actions/customerActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import handleServerAction from '@/lib/handleServerAction'

export default function AddExistingCustomerForm({ refetchCustomers }) {
  const router = useRouter()
  const params = useParams()

  const stockCycleId = params.stockCycle

  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailId, setEmailId] = useState('')

  const [billingNameError, setBillingNameError] = useState('')
  const [billingAddressError, setBillingAddressError] = useState('')

  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  const {
    data: customerResponse,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomerAction, selectedCustomerId),
    queryKey: ['getCustomerAction', selectedCustomerId],
    enabled: Boolean(selectedCustomerId),
  })

  const { mutate: addCustomer, isPending: isAddCustomerLoading } = useMutation({
    mutationFn: (data) => handleServerAction(addCustomerAction, data),
  })

  const handleClose = useCallback(() => {
    router.back()

    setBillingName('')
    setBillingAddress('')
    setPhoneNumber('')
    setEmailId('')

    setBillingNameError(false)
    setBillingAddressError(false)
  }, [router])

  useEffect(() => {
    const customerDetails = customerResponse?.customerDetails?.[0]
    if (customerDetails) {
      setBillingName(customerDetails?.billingName)
      setBillingAddress(customerDetails?.billingAddress)
      setEmailId(customerDetails?.emailId)
      setPhoneNumber(customerDetails?.phoneNumber)
    } else {
      setBillingName('')
      setBillingAddress('')
      setEmailId('')
      setPhoneNumber('')
    }
  }, [customerResponse?.customerDetails])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      let error = false
      if (!billingName) {
        setBillingNameError(true)
        error = true
      }
      if (!billingAddress) {
        setBillingAddressError(true)
        error = true
      }
      if (error) return true
      if (!selectedCustomerId) return
      addCustomer(
        {
          customerId: selectedCustomerId,
          stockCycleId,
          billingName,
          billingAddress,
          emailId,
          phoneNumber,
        },

        {
          onSuccess: async (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            await refetchCustomers()
            handleClose()
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [
      billingName,
      billingAddress,
      selectedCustomerId,
      addCustomer,
      stockCycleId,
      emailId,
      phoneNumber,
      refetchCustomers,
      handleClose,
    ]
  )

  return (
    <>
      <DialogContent>
        <ErrorAlert isError={isCustomerError} error={customerError}>
          <Box>
            <Grid container columnSpacing={2} columns={{ xs: 1, sm: 2 }}>
              <Grid size={1}>
                <CustomerSelector
                  selectedCustomerId={selectedCustomerId}
                  setSelectedCustomerId={setSelectedCustomerId}
                  filter={{ stockCycle: { id: stockCycleId, exists: false } }}
                  isLoading={isCustomerLoading}
                  customerResponse={customerResponse}
                />
              </Grid>
              <Grid size={1} className='py-2' alignSelf='center'>
                Customer ID: {selectedCustomerId}
              </Grid>
            </Grid>
          </Box>
          <Divider className='my-4' />
          <Box component='form' noValidate onSubmit={handleSubmit}>
            <input type='submit' hidden />
            <Grid container columnSpacing={2} columns={{ xs: 1, sm: 2 }}>
              <Grid size={{ xs: 1, sm: 2 }}>
                The following fields are specific to the selected{' '}
                <b>Stock Cycle</b>.
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  label='Billing Name'
                  name='billingName'
                  value={billingName}
                  onChange={(e) => {
                    setBillingName(e.target.value)
                    setBillingNameError(e.target.value === '')
                  }}
                  error={billingNameError}
                />
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  label='Billing Address'
                  name='billingAddress'
                  multiline
                  value={billingAddress}
                  onChange={(e) => {
                    setBillingAddress(e.target.value)
                    setBillingAddressError(e.target.value === '')
                  }}
                  error={billingAddressError}
                />
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  fullWidth
                  label='Email Address'
                  name='email'
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                />
              </Grid>
              <Grid size={1}>
                <TextField
                  margin='normal'
                  fullWidth
                  label='Phone Number'
                  name='phoneNumber'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </ErrorAlert>
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          type='submit'
          disabled={!selectedCustomerId || isAddCustomerLoading}
          loading={isAddCustomerLoading}
          onClick={handleSubmit}>
          Add Customer
        </Button>
      </DialogActions>
    </>
  )
}
