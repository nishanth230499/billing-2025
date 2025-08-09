import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getCustomerAction } from '@/actions/customerActions'
import { createSalesOrderAction } from '@/actions/salesOrderActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import CustomerShippingAddressSelector from '@/components/common/selectors/CustomerShippingAddressSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import { numberRegex } from '@/lib/regex'
import {
  dateStringValidator,
  getCurrentDateString,
} from '@/lib/utils/dateUtils'

import SelectedItemTableActions from './SelectedItemTableActions'

export default function SelectedItemsPanel({
  selectedItems,
  setSelectedItems,
  selectedItemsOrder,
  setSelectedItemsOrder,
}) {
  const params = useParams()
  const { searchParams, replaceURL } = useHandleSearchParams()
  const { appConfig } = useContext(AppContext)

  const stockCycleId = params.stockCycle
  const customerId = useMemo(
    () => searchParams.get('customerId') || '',
    [searchParams]
  )
  const { IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE } = appConfig

  const [orderRef, setOrderRef] = useState('')
  const [isSetPack, setIsSetPack] = useState(false)
  const [customerShippingAddressId, setCustomerShippingAddressId] = useState('')
  const [supplyDate, setSupplyDate] = useState('')

  const [isCustomerIdTouched, setIsCustomerIdTouched] = useState(false)
  const [isSupplyDateTouched, setIsSupplyDateTouched] = useState(false)

  useEffect(() => {
    if (customerId) {
      setCustomerShippingAddressId('')
    } else {
      setCustomerShippingAddressId('')
    }
  }, [customerId])

  const handleDeleteItem = useCallback(
    (itemKeyToBeDeleted) => {
      setSelectedItems((items) => ({
        ...items,
        [itemKeyToBeDeleted]: undefined,
      }))
      setSelectedItemsOrder((itemKeys) =>
        itemKeys.filter((itemKey) => itemKey !== itemKeyToBeDeleted)
      )
    },
    [setSelectedItems, setSelectedItemsOrder]
  )

  const selectedItemTableColumns = useMemo(
    () => ({
      _id: { label: 'ID' },
      companyShortName: {
        label: 'Company Short Name',
        format: (item) => item?.company?.shortName,
      },
      name: { label: 'Name' },
      group: {
        label: 'Group',
        editable: true,
        nextColumnKey: 'quantity',
        validator: (item) => !isSetPack || item?.group,
      },
      quantity: {
        label: 'Quantity',
        editable: true,
        previousColumnKey: 'group',
        nextColumnKey: 'unitQuantity',
        validator: (item) => numberRegex.test(item?.quantity),
      },
      unitQuantity: {
        label: 'Unit Quantity',
        editable: true,
        previousColumnKey: 'quantity',
        validator: (item) => numberRegex.test(item?.unitQuantity),
      },
      actions: {
        label: 'Actions',
        component: (props) => (
          <SelectedItemTableActions
            {...props}
            handleDeleteItem={handleDeleteItem}
          />
        ),
        slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
      },
    }),
    [handleDeleteItem, isSetPack]
  )

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

  const { mutate: createSalesOrder, isPending: isCreateSalesOrderLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(createSalesOrderAction, ...data),
    })

  const handleSubmit = useCallback(() => {
    setIsCustomerIdTouched(true)
    setIsSupplyDateTouched(true)
    // This rule is not present in DB
    if (!selectedItemsOrder?.length) {
      enqueueSnackbar('Please add items on to the order.', {
        variant: 'error',
      })
      return
    }
    if (!(customerId && supplyDate)) {
      enqueueSnackbar('Please resolve errors on the order.', {
        variant: 'error',
      })
      return
    }

    if (
      selectedItemsOrder?.some((itemKey) => {
        const item = selectedItems?.[itemKey]
        return !(
          numberRegex.test(item?.quantity) &&
          numberRegex.test(item?.unitQuantity) &&
          // This rule is not present in DB
          (!isSetPack || item?.group)
        )
      })
    ) {
      enqueueSnackbar('Please resolve errors on the order.', {
        variant: 'error',
      })
      return
    }
    createSalesOrder(
      [
        stockCycleId,
        {
          customerId,
          customerShippingAddressId: customerShippingAddressId || undefined,
          date: getCurrentDateString(),
          supplyDate,
          orderRef,
          isSetPack,
          items: selectedItemsOrder?.map((itemKey) => {
            const item = selectedItems?.[itemKey]
            return {
              itemId: item?._id,
              group: item?.group,
              quantity: item?.quantity,
              unitQuantity: item?.unitQuantity,
            }
          }),
        },
      ],
      {
        onSuccess: async (data) => {
          enqueueSnackbar(data, { variant: 'success' })
          // await refetchCustomers()
          // handleCloseModal()
        },
        onError: (error) =>
          enqueueSnackbar(error.message, { variant: 'error' }),
      }
    )
  }, [
    createSalesOrder,
    customerId,
    customerShippingAddressId,
    isSetPack,
    orderRef,
    selectedItems,
    selectedItemsOrder,
    stockCycleId,
    supplyDate,
  ])

  return (
    <Fragment key='123'>
      <Typography variant='h6'>Create New Order</Typography>
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
                setIsCustomerIdTouched(true)
                replaceURL({ customerId: id || undefined })
              }}
              filter={
                IS_CUSTOMER_SPECIFIC_TO_STOCK_CYCLE
                  ? { stockCycle: { id: stockCycleId } }
                  : {}
              }
              error={isCustomerIdTouched && !customerId}
              required
              isLoading={isCustomerLoading}
              customerResponse={customerResponse}
            />
          </ErrorAlert>
        </Grid>
        <Grid size={1}>
          <TextField
            margin='normal'
            fullWidth
            label='Order Ref.'
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
          />
        </Grid>
        <Grid size={1}>
          <FormControlLabel
            control={
              <Switch
                checked={isSetPack}
                onChange={(e) => setIsSetPack(e.target.checked)}
              />
            }
            label='Set Pack'
            labelPlacement='start'
          />
        </Grid>
        <Grid size={1}>
          <CustomerShippingAddressSelector
            selectedCustomerShippingAddressId={customerShippingAddressId}
            setSelectedCustomerShippingAddressId={setCustomerShippingAddressId}
            customerId={customerId}
          />
        </Grid>
        <Grid size={1}>
          <DateSelector
            required
            label='Supply Date'
            selectedDate={supplyDate}
            setSelectedDate={(date) => {
              setSupplyDate(date)
              setIsSupplyDateTouched(true)
            }}
            error={isSupplyDateTouched && !dateStringValidator(supplyDate)}
          />
        </Grid>
        <Grid size={1}>
          <Button
            className='rounded-3xl'
            variant='outlined'
            fullWidth
            disabled={!customerId}>
            Add Previous Stock Cycle Order
          </Button>
        </Grid>
      </Grid>
      <DataTable
        columns={selectedItemTableColumns}
        data={selectedItems}
        dataOrder={selectedItemsOrder}
        setData={setSelectedItems}
        setDataOrder={setSelectedItemsOrder}
        className='grow'
      />
      <Box className='flex items-center justify-between mt-4'>
        <Button className='rounded-3xl' variant='outlined'>
          Auto Apply Quantity
        </Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          disabled={isCreateSalesOrderLoading}
          loading={isCreateSalesOrderLoading}
          onClick={handleSubmit}>
          Save
        </Button>
      </Box>
    </Fragment>
  )
}
