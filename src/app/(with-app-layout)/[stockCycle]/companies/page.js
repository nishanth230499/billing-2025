'use client'

import { Box, Button, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'

import { getCompaniesAction } from '@/actions/companyActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import TableSkeleton from '@/components/TableSkeleton'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import CompanyTableActions from './CompanyTableActions'
import CreateCompanyFormModal from './CreateCompanyFormModal'
import EditCompanyFormModal from './EditCompanyFormModal'

const companiesTableColumns = {
  _id: { label: 'ID' },
  name: { label: 'Name' },
  actions: {
    label: 'Actions',
    component: CompanyTableActions,
    slotProps: { tableBodyCell: { sx: { paddingY: 0 } } },
  },
}

export default function Page() {
  const { getURL, searchParams } = useHandleSearchParams()

  const pageNumber = useMemo(
    () => Number(searchParams.get('pageNumber')) || 0,
    [searchParams]
  )
  const pageSize = useMemo(
    () => Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
    [searchParams]
  )
  const searchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )

  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    error: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCompaniesAction, {
        pageNumber,
        pageSize,
        searchText,
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: ['getCompaniesAction', pageNumber, pageSize, searchText],
  })

  return (
    <>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Companies</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            onClick={() =>
              window.history.pushState({}, '', getURL({ create: true }))
            }>
            Create New Company
          </Button>
        </Box>
      </Box>
      <Box className='mb-4'>
        <SearchBar label='Search for Companies' />
      </Box>
      <CreateCompanyFormModal refetchCompanies={refetchCompanies} />
      <EditCompanyFormModal refetchCompanies={refetchCompanies} />
      {isCompaniesLoading && <TableSkeleton />}
      <ErrorAlert isError={isCompaniesError} error={companiesError}>
        <DataTable
          hidden={isCompaniesLoading}
          data={Object.fromEntries(
            companiesResponse?.paginatedResults?.map((company) => [
              company?._id,
              {
                ...company,
                _metaData: { highlightColor: company?.firm?.color },
              },
            ]) || []
          )}
          dataOrder={companiesResponse?.paginatedResults?.map(
            (user) => user?._id
          )}
          columns={companiesTableColumns}
          totalCount={companiesTableColumns?.totalCount}
        />
      </ErrorAlert>
    </>
  )
}
