'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function ItemTableActions({ data }) {
  const { setModalValue: setEditItemModalValue } = useModalControl('editItem')
  return (
    <Tooltip title='Edit Item'>
      <IconButton
        color='primary'
        onClick={() => setEditItemModalValue(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
