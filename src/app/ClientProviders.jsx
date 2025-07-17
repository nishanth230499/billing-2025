'use client'

import { IconButton } from '@mui/material'
import { closeSnackbar, SnackbarProvider } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import { DndProvider } from 'react-dnd'
import { isMobile } from 'react-device-detect'
import { TouchBackend } from 'react-dnd-touch-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createContext, useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

function SnackbarCloseButton({ snackbarKey }) {
  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)} color='inherit'>
      <CloseIcon />
    </IconButton>
  )
}

export const AppContext = createContext({})

export default function ClientProviders({ children, appConfig }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
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
          <AppContext.Provider value={{ appConfig }}>
            {children}
          </AppContext.Provider>
        </QueryClientProvider>
      </SnackbarProvider>
    </DndProvider>
  )
}
