'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'

import useModalControl from '@/hooks/useModalControl'

export default function DocumentsTableActions({ data }) {
  const { setModalValue: setEditDocumentModalValue } =
    useModalControl('editDocument')

  return (
    <Tooltip title='Edit Document'>
      <IconButton
        color='primary'
        onClick={() => setEditDocumentModalValue(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
