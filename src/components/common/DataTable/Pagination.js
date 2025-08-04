'use client'

import { TablePagination } from '@mui/material'

import { DEFAULT_PAFE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants'

export default function Pagination({
  totalCount,
  pageNumber = 0,
  setPageNumber,
  pageSize = DEFAULT_PAGE_SIZE,
  setPageSize,
}) {
  // const { searchParams, getURL } = useHandleSearchParams()

  // const pageNumber = Number(searchParams.get(pageNumberSearchParamName)) || 0
  // const pageSize =
  //   Number(searchParams.get(pageSizeSearchParamName)) || DEFAULT_PAGE_SIZE

  return (
    <>
      <TablePagination
        rowsPerPageOptions={DEFAULT_PAFE_SIZE_OPTIONS}
        component='div'
        count={totalCount}
        rowsPerPage={pageSize}
        page={pageNumber}
        labelRowsPerPage='Page Size:'
        className='sticky bottom-0 left-0'
        onPageChange={(_, page) => setPageNumber(page)}
        onRowsPerPageChange={(e) => setPageSize(e.target.value)}
        slotProps={{
          root: {
            sx: { backgroundColor: 'inherit', backgroundImage: 'inherit' },
          },
          toolbar: { className: 'pr-0' },
          // actions: {
          //   nextButton: {
          //     component: Link,
          //     href: getURL({ [pageNumberSearchParamName]: pageNumber + 1 }),
          //     replace: true,
          //     onClick: null,
          //   },
          //   previousButton: {
          //     component: Link,
          //     href: getURL({ [pageNumberSearchParamName]: pageNumber - 1 }),
          //     replace: true,
          //     onClick: null,
          //   },
          // },
          select: { className: 'mr-4' },
          displayedRows: { className: '-mr-2' },
        }}
        // slots={{
        //   select: (selectProps) => (
        //     <Select
        //       {...selectProps}
        //       sx={{
        //         color: 'inherit',
        //         fontSize: 'inherit',
        //         flexShrink: 0,
        //         marginRight: '32px',
        //         marginLeft: '8px',
        //       }}>
        //       {selectProps?.children.map((child) => (
        //         <MenuItem
        //           {...child?.props}
        //           href={getURL({
        //             [pageSizeSearchParamName]: child?.props?.value,
        //             [pageNumberSearchParamName]: 0,
        //           })}
        //           component={Link}
        //           replace
        //         />
        //       ))}
        //     </Select>
        //   ),
        // }}
      />
    </>
  )
}
