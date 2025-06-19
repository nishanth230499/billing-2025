'use client'

import { IconButton } from '@mui/material'
import { closeSnackbar, SnackbarProvider } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import { DndProvider } from 'react-dnd'
import { isMobile } from 'react-device-detect'
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

function SnackbarCloseButton({ snackbarKey }) {
  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)} color='inherit'>
      <CloseIcon />
    </IconButton>
  )
}

export default function ClientProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })
  )
  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <SnackbarProvider
        maxSnack={3}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SnackbarProvider>
    </DndProvider>
  )
}
