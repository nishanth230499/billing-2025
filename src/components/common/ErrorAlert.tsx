import { Alert } from '@mui/material'
import { ReactNode } from 'react'

export default function ErrorAlert({
  isError,
  error,
  children,
}: {
  isError?: Boolean
  error?: Error
  children?: ReactNode
}) {
  if (isError) return <Alert severity='error'>{error?.message}</Alert>
  return children
}
