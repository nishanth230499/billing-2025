'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import {
  getCustomerShippingAddressAction,
  getCustomerShippingAddressesAction,
} from '@/actions/customerShippingAddressActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function CustomerShippingAddressSelector({
  selectedCustomerShippingAddressId,
  setSelectedCustomerShippingAddressId,
  customerId,
  required,
  error,
}) {
  const [inputValue, setInputValue] = useState('')
  const [searchText] = useDebounce(inputValue, 1000)

  const {
    data: customerShippingAddressesResponse,
    isLoading: isCustomerShippingAddressesLoading,
    isError: isCustomerShippingAddressesError,
    error: customerShippingAddressesError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomerShippingAddressesAction, {
        customerId,
        searchText: searchText === 'Ship to Same Address' ? '' : searchText,
      }),
    queryKey: [
      'getCustomerShippingAddressesAction',
      customerId,
      searchText === 'Ship to Same Address' ? '' : searchText,
    ],
    enabled: Boolean(customerId),
  })

  const {
    data: customerShippingAddressResponse,
    isLoading: isCustomerShippingAddressLoading,
    isError: isCustomerShippingAddressError,
    error: customerShippingAddressError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(
        getCustomerShippingAddressAction,
        selectedCustomerShippingAddressId
      ),
    queryKey: [
      'getCustomerShippingAddressAction',
      selectedCustomerShippingAddressId,
    ],
    enabled: Boolean(selectedCustomerShippingAddressId),
  })

  return (
    <ErrorAlert
      isError={isCustomerShippingAddressesError}
      error={customerShippingAddressesError}>
      <ErrorAlert
        isError={isCustomerShippingAddressError}
        error={customerShippingAddressError}>
        <AutoComplete
          error={error}
          required={required}
          loading={
            isCustomerShippingAddressesLoading ||
            isCustomerShippingAddressLoading
          }
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedKey={selectedCustomerShippingAddressId}
          selectedLabel={
            customerShippingAddressResponse?.name ?? 'Ship to Same Address'
          }
          setSelectedKey={setSelectedCustomerShippingAddressId}
          options={
            customerShippingAddressesResponse?.paginatedResults?.map(
              (address) => ({
                key: address?._id,
                label: address?.name,
              })
            ) || []
          }
          placeholder='Search for Shipping Addresses'
          noOptionsText='No Shipping Addresses Found'
        />
      </ErrorAlert>
    </ErrorAlert>
  )
}
