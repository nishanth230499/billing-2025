'use client'

import AddIcon from '@mui/icons-material/Add'
import { IconButton, Tooltip } from '@mui/material'

export default function SearchedItemTableActions({ data, handleAddItem }) {
  return (
    <Tooltip title='Add Item'>
      <IconButton color='primary' onClick={() => handleAddItem(data)}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  )
}
