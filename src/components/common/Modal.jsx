'use client'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import {
  Dialog,
  DialogTitle,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export default function Modal({
  children,
  openSearchParamKey,
  title,
  maxWidth = 'md',
  goBackOnClose = true,
}) {
  const router = useRouter()
  const { searchParams, getURL } = useHandleSearchParams()

  const openSearchParamValue = searchParams.get(openSearchParamKey)
  const open = useMemo(
    () => Boolean(openSearchParamValue) && openSearchParamValue !== 'false'
  )

  const theme = useTheme()
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'))

  const handleClose = useCallback(
    goBackOnClose
      ? router.back
      : () => router.redirect(getURL({ [openSearchParamKey]: null })),
    [goBackOnClose, router, getURL, openSearchParamKey]
  )

  if (isMobileWidth) {
    return (
      <SwipeableDrawer
        anchor='bottom'
        open={open}
        onClose={handleClose}
        disableSwipeToOpen
        sx={{ zIndex: 'modal' }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '90%',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          },
        }}>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </SwipeableDrawer>
    )
  }
  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={handleClose}>
      <IconButton
        aria-label='close'
        onClick={handleClose}
        className='absolute top-2 right-2'>
        <CloseIcon />
      </IconButton>
      <DialogTitle>{title}</DialogTitle>
      {children}
    </Dialog>
  )
}
