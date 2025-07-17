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
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useState } from 'react'

import { createCustomerAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import FirmSelector from '@/components/common/selectors/FirmSelector'
import handleServerAction from '@/lib/handleServerAction'
import { amountRegex } from '@/lib/regex'
import { modelConstants } from '@/models/constants'

export default function CreateCustomerForm({ refetchCustomers }) {
  const router = useRouter()
  const params = useParams()

  const stockCycleId = params.stockCycle

  const { appConfig } = useContext(AppContext)
  const {
    AUTO_GENERATE_CUSTOMER_ID,
    CUSTOMER_DETAILS_SPECIFIC_TO,
    CUSTOMER_ID_REGEX,
  } = appConfig

  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [place, setPlace] = useState('')
  const [firmId, setFirmId] = useState('')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [billingName, setBillingName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailId, setEmailId] = useState('')

  const [idError, setIdError] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [placeError, setPlaceError] = useState(false)
  const [firmIdError, setFirmIdError] = useState(false)
  const [openingBalanceError, setOpeningBalanceError] = useState(false)
  const [billingNameError, setBillingNameError] = useState('')
  const [billingAddressError, setBillingAddressError] = useState('')

  const { mutate: createCustomer, isPending: isCreateCustomerLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(createCustomerAction, data),
    })

  const handleClose = useCallback(() => {
    router.back()

    setId('')
    setName('')
    setPlace('')
    setFirmId('')
    setOpeningBalance('0')
    setBillingName('')
    setBillingAddress('')
    setPhoneNumber('')
    setEmailId('')

    setIdError(false)
    setNameError(false)
    setPlaceError(false)
    setFirmIdError(false)
    setOpeningBalanceError(false)
    setBillingNameError(false)
    setBillingAddressError(false)
  }, [router])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      let error = false
      if (
        !AUTO_GENERATE_CUSTOMER_ID &&
        !new RegExp(CUSTOMER_ID_REGEX).test(id)
      ) {
        setIdError(true)
        error = true
      }
      if (!name) {
        setNameError(true)
        error = true
      }
      if (!place) {
        setPlaceError(true)
        error = true
      }
      if (!firmId) {
        setFirmIdError(true)
        error = true
      }
      if (!amountRegex.test(openingBalance)) {
        setOpeningBalanceError(true)
        error = true
      }
      if (!billingName) {
        setBillingNameError(true)
        error = true
      }
      if (!billingAddress) {
        setBillingAddressError(true)
        error = true
      }
      if (error) return true
      createCustomer(
        {
          _id: id,
          name,
          place,
          firmId,
          openingBalance: parseInt(openingBalance),
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
      AUTO_GENERATE_CUSTOMER_ID,
      CUSTOMER_ID_REGEX,
      id,
      name,
      place,
      firmId,
      openingBalance,
      billingName,
      billingAddress,
      createCustomer,
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
        <Box component='form' noValidate onSubmit={handleSubmit}>
          <input type='submit' hidden />
          <Grid container columnSpacing={2} columns={{ xs: 1, sm: 2 }}>
            {!AUTO_GENERATE_CUSTOMER_ID && (
              <Grid size={1}>
                <TextField
                  autoFocus
                  margin='normal'
                  required
                  fullWidth
                  label='ID'
                  name='id'
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value)
                    setIdError(
                      !new RegExp(CUSTOMER_ID_REGEX).test(e.target.value)
                    )
                  }}
                  error={idError}
                />
              </Grid>
            )}
            <Grid size={1}>
              <TextField
                margin='normal'
                required
                fullWidth
                label='Name'
                name='name'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(!e.target.value)
                }}
                error={nameError}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                margin='normal'
                required
                fullWidth
                label='Place'
                name='place'
                value={place}
                onChange={(e) => {
                  setPlace(e.target.value)
                  setPlaceError(!e.target.value)
                }}
                error={placeError}
              />
            </Grid>
            <Grid size={1}>
              <FirmSelector
                selectedFirmId={firmId}
                setSelectedFirmId={(val) => {
                  setFirmId(val)
                  setFirmIdError(!val)
                }}
                error={firmIdError}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                margin='normal'
                required
                fullWidth
                label='Opening Balance'
                name='openingBalance'
                value={openingBalance}
                onChange={(e) => {
                  setOpeningBalance(e.target.value)
                  setOpeningBalanceError(!amountRegex.test(e.target.value))
                }}
                error={openingBalanceError}
              />
            </Grid>
          </Grid>
          <Divider className='my-4' />
          <Grid container columnSpacing={2} columns={{ xs: 1, sm: 2 }}>
            {CUSTOMER_DETAILS_SPECIFIC_TO.includes(
              modelConstants.stock_cycle.collectionName
            ) && (
              <Grid size={{ xs: 1, sm: 2 }}>
                The following fields are specific to the selected{' '}
                <b>Stock Cycle</b>.
              </Grid>
            )}
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
      </DialogContent>
      <DialogActions className='px-6 pb-5'>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          type='submit'
          disabled={isCreateCustomerLoading}
          loading={isCreateCustomerLoading}
          onClick={handleSubmit}>
          Add Customer
        </Button>
      </DialogActions>
    </>
  )
}
