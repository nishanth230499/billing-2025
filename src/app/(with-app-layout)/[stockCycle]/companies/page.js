'use client'

import { Box, Button, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { getCompaniesAction } from '@/actions/companyActions'
import DataTable from '@/components/common/DataTable'
import ErrorAlert from '@/components/common/ErrorAlert'
import SearchBar from '@/components/common/SearchBar'
import TableSkeleton from '@/components/TableSkeleton'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import useModalControl from '@/hooks/useModalControl'
import usePaginationControl from '@/hooks/usePaginationControl'
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
  const { searchParams, replaceURL } = useHandleSearchParams()
  const searchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )

  const paginationProps = usePaginationControl()
  const { getModalURL: getCreateCompanyModalURL } = useModalControl('create')

  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    error: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getCompaniesAction, {
        pageNumber: paginationProps?.pageNumber,
        pageSize: paginationProps?.pageSize,
        searchText,
        sortFields: searchText ? {} : { _id: 1 },
      }),
    queryKey: [
      'getCompaniesAction',
      paginationProps?.pageNumber,
      paginationProps?.pageSize,
      searchText,
    ],
  })

  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Companies</Typography>
        <Box className='flex items-center gap-2'>
          <Button
            className='rounded-3xl'
            variant='outlined'
            LinkComponent={Link}
            href={getCreateCompanyModalURL(true)}>
            Create New Company
          </Button>
        </Box>
      </Box>
      <Box className='mb-4'>
        <SearchBar
          label='Search for Companies'
          searchText={searchText}
          setSearchText={(text) =>
            replaceURL({ searchText: text || undefined })
          }
        />
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
          paginationProps={{
            ...paginationProps,
            totalCount: companiesResponse?.totalCount,
          }}
        />
      </ErrorAlert>
    </Paper>
  )
}
