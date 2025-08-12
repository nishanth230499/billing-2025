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
import { useParams, useRouter } from 'next/navigation'
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
import {
  createSalesOrderAction,
  editSalesOrderAction,
  getSalesOrderAction,
} from '@/actions/salesOrderActions'
import { AppContext } from '@/app/ClientProviders'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import Loader from '@/components/common/Loader'
import CustomerSelector from '@/components/common/selectors/CustomerSelector'
import CustomerShippingAddressSelector from '@/components/common/selectors/CustomerShippingAddressSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import TableSkeleton from '@/components/TableSkeleton'
import routes from '@/constants/routeConstants'
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
  editingSalesOrderNumber,
}) {
  const params = useParams()
  const router = useRouter()
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
      _id: {
        label: 'ID',
        href: (item) => routes.item.legend(stockCycleId, item?._id),
        target: '_blank',
      },
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
    [handleDeleteItem, isSetPack, stockCycleId]
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
        editingSalesOrderNumber
      ),
    queryKey: ['getSalesOrderAction', stockCycleId, editingSalesOrderNumber],
    enabled: Boolean(stockCycleId) && Boolean(editingSalesOrderNumber),
  })

  useEffect(() => {
    if (salesOrderResponse) {
      replaceURL({ customerId: salesOrderResponse?.customerId || undefined })
      setOrderRef(salesOrderResponse?.orderRef)
      setIsSetPack(salesOrderResponse?.isSetPack)
      setCustomerShippingAddressId(
        salesOrderResponse?.customerShippingAddressId
      )
      setSupplyDate(salesOrderResponse?.supplyDate)
      const selectedItems = Object.fromEntries(
        salesOrderResponse?.items?.map((item) => [
          // TODO: Does not work in mobile
          crypto.randomUUID(),
          { ...item, ...item?.item },
        ])
      )
      setSelectedItems(selectedItems)
      setSelectedItemsOrder(Object.keys(selectedItems))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesOrderResponse])

  const { mutate: createSalesOrder, isPending: isCreateSalesOrderLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(createSalesOrderAction, ...data),
    })

  const { mutate: editSalesOrder, isPending: isEditSalesOrderLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(editSalesOrderAction, ...data),
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
    if (editingSalesOrderNumber) {
      editSalesOrder(
        [
          stockCycleId,
          editingSalesOrderNumber,
          {
            customerId,
            customerShippingAddressId: customerShippingAddressId || null,
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
            enqueueSnackbar(data?.message, { variant: 'success' })
            router.push(routes.salesOrder.view(stockCycleId, data?.orderNumber))
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    } else {
      createSalesOrder(
        [
          stockCycleId,
          {
            customerId,
            customerShippingAddressId: customerShippingAddressId || null,
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
            enqueueSnackbar(data?.message, { variant: 'success' })
            router.push(routes.salesOrder.view(stockCycleId, data?.orderNumber))
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    }
  }, [
    createSalesOrder,
    customerId,
    customerShippingAddressId,
    editSalesOrder,
    editingSalesOrderNumber,
    isSetPack,
    orderRef,
    router,
    selectedItems,
    selectedItemsOrder,
    stockCycleId,
    supplyDate,
  ])

  return (
    <Fragment key='123'>
      <Typography variant='h6'>Create New Order</Typography>
      <ErrorAlert isError={isSalesOrderError} error={salesOrderError}>
        <Loader loading={isSalesOrderLoading} />
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
              setSelectedCustomerShippingAddressId={
                setCustomerShippingAddressId
              }
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
              disabled={!customerId || editingSalesOrderNumber}>
              Add Previous Stock Cycle Order
            </Button>
          </Grid>
        </Grid>
        {isSalesOrderLoading && <TableSkeleton />}
        <DataTable
          hidden={isSalesOrderLoading}
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
            disabled={isCreateSalesOrderLoading || isEditSalesOrderLoading}
            loading={isCreateSalesOrderLoading || isEditSalesOrderLoading}
            onClick={handleSubmit}>
            Save
          </Button>
        </Box>
      </ErrorAlert>
    </Fragment>
  )
}
