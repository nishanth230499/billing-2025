'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton } from '@mui/material'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function DocumentsTableActions({ data }) {
  const { getURL } = useHandleSearchParams()
  return (
    <IconButton
      color='primary'
      onClick={() =>
        window.history.pushState({}, '', getURL({ edit_document: data?._id }))
      }>
      <EditIcon />
    </IconButton>
  )
}
