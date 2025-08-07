'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function ItemTableActions({ data }) {
  const { getModalURL: getEditItemModalURL } = useModalControl('editItem')
  return (
    <Tooltip title='Edit Item'>
      <IconButton
        color='primary'
        LinkComponent={Link}
        href={getEditItemModalURL(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
