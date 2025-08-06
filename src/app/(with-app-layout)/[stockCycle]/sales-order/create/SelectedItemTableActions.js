'use client'

import DeleteIcon from '@mui/icons-material/Delete'
import { IconButton, Tooltip } from '@mui/material'

export default function SelectedItemTableActions({
  dataKey,
  handleDeleteItem,
}) {
  return (
    <Tooltip title='Delete Item'>
      <IconButton color='primary' onClick={() => handleDeleteItem(dataKey)}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  )
}
