'use client'

import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'

import useModalControl from '@/hooks/useModalControl'

export default function DocumentsTableActions({ data }) {
  const { getModalURL: getEditDocumentModalURL } =
    useModalControl('editDocument')

  return (
    <Tooltip title='Edit Document'>
      <IconButton
        color='primary'
        LinkComponent={Link}
        href={getEditDocumentModalURL(data?._id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  )
}
