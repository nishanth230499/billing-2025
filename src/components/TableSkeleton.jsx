'use client'

import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

export default function TableSkeleton() {
  return (
    <TableContainer
      className='min-h-60'
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: 5 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton animation='wave' />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 5 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton animation='wave' />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
