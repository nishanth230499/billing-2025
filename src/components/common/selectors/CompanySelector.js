'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import { getCompaniesAction, getCompanyAction } from '@/actions/companyActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function CompanySelector({
  selectedCompanyId,
  setSelectedCompanyId,
  required,
  error,
}) {
  const [inputValue, setInputValue] = useState('')
  const [searchText] = useDebounce(inputValue, 1000)

  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    error: companiesError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCompaniesAction, { searchText }),
    queryKey: ['getCompaniesAction', searchText],
  })

  const {
    data: companyResponse,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: companyError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCompanyAction, selectedCompanyId),
    queryKey: ['getCustomerAction', selectedCompanyId],
    enabled: Boolean(selectedCompanyId),
  })

  return (
    <ErrorAlert isError={isCompaniesError} error={companiesError}>
      <ErrorAlert isError={isCompanyError} error={companyError}>
        <AutoComplete
          error={error}
          required={required}
          loading={isCompaniesLoading || isCompanyLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedKey={selectedCompanyId}
          selectedLabel={companyResponse?.name ?? ''}
          setSelectedKey={setSelectedCompanyId}
          options={
            companiesResponse?.paginatedResults?.map((company) => ({
              key: company?._id,
              label: company?.name,
              highlightColor: company?.firm?.color,
            })) || []
          }
          placeholder='Search for Companies'
          noOptionsText='No Companies Found'
        />
      </ErrorAlert>
    </ErrorAlert>
  )
}
