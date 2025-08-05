'use client'

import { Paper, TablePagination } from '@mui/material'

import { DEFAULT_PAFE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants'

export default function Pagination({
  totalCount,
  pageNumber = 0,
  setPageNumber,
  pageSize = DEFAULT_PAGE_SIZE,
  setPageSize,
}) {
  return (
    <>
      <TablePagination
        rowsPerPageOptions={DEFAULT_PAFE_SIZE_OPTIONS}
        component='div'
        count={totalCount}
        rowsPerPage={pageSize}
        page={pageNumber}
        labelRowsPerPage='Page Size:'
        className='sticky bottom-0 left-0 shrink-0'
        onPageChange={(_, page) => setPageNumber(page)}
        onRowsPerPageChange={(e) => setPageSize(e.target.value)}
        slotProps={{
          root: { elevation: 1, sx: { overflow: 'auto' } },
          toolbar: { className: 'pr-0' },
          select: { className: 'mr-4' },
          displayedRows: { className: '-mr-2' },
        }}
        slots={{ root: Paper }}
      />
    </>
  )
}
