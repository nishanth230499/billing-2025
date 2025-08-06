import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getCustomerAction } from '@/actions/customerActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import CustomerShippingAddressSelector from '@/components/common/selectors/CustomerShippingAddressSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'
import { numberRegex } from '@/lib/regex'
import { dateStringValidator } from '@/lib/utils/dateUtils'

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
      group: { label: 'Group', editable: true, nextColumnKey: 'quantity' },
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
    [handleDeleteItem]
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
        onDataChange={setSelectedItems}
        onDataOrderChange={setSelectedItemsOrder}
        className='grow'
      />
      <Box className='flex items-center justify-between mt-4'>
        <Button className='rounded-3xl' variant='outlined'>
          Auto Apply Quantity
        </Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          disabled={false}
          loading={false}>
          Save
        </Button>
      </Box>
    </Fragment>
  )
}
