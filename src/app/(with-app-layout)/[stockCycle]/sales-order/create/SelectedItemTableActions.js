'use client'

import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useMemo } from 'react'

export default function SelectedItemTableActions({
  dataKey,
  handleDeleteItem,
  addBeforeKey,
  setAddBeforeKey,
}) {
  const isAddBefore = useMemo(
    () => addBeforeKey === dataKey,
    [addBeforeKey, dataKey]
  )
  return (
    <Box className='flex'>
      <Tooltip
        title={
          isAddBefore
            ? 'Adding Items Before This'
            : 'Click to Add Items Before This'
        }>
        <IconButton
          color={isAddBefore ? 'primary' : 'default'}
          onClick={() =>
            isAddBefore ? setAddBeforeKey(null) : setAddBeforeKey(dataKey)
          }>
          <KeyboardDoubleArrowUpIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Delete Item'>
        <IconButton color='primary' onClick={() => handleDeleteItem(dataKey)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
