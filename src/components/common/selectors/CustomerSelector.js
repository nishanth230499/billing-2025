'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import { getCustomersAction } from '@/actions/customerActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function CustomerSelector({
  filter,
  selectedCustomerId,
  setSelectedCustomerId,
  isLoading,
  customerResponse,
}) {
  const [inputValue, setInputValue] = useState('')
  const [searchText] = useDebounce(inputValue, 1000)

  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    error: customersError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCustomersAction, { searchText, filter }),
    queryKey: ['getCustomersAction', searchText],
  })

  return (
    <ErrorAlert isError={isCustomersError} error={customersError}>
      <AutoComplete
        loading={isCustomersLoading || isLoading}
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedKey={selectedCustomerId}
        selectedLabel={
          customerResponse
            ? `${customerResponse?.name}, ${customerResponse?.place}`
            : ''
        }
        setSelectedKey={setSelectedCustomerId}
        options={
          customersResponse?.paginatedResults?.map((customer) => ({
            key: customer?._id,
            label: `${customer?.name}, ${customer?.place}`,
          })) || []
        }
        placeholder='Search for Customers to Add'
        noOptionsText='No Customers Found'
      />
    </ErrorAlert>
  )
}
