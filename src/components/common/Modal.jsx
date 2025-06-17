'use client'

import { TABLET_MAX_WIDTH } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { redirect } from 'next/navigation'
import { useMemo } from 'react'

export default function Modal({
  children,
  openSearchParamKey,
  title,
  maxWidth = 'md',
}) {
  const [searchParams, getURL] = useHandleSearchParams()

  const openSearchParamValue = searchParams.get(openSearchParamKey)
  const open = useMemo(
    () => Boolean(openSearchParamValue) && openSearchParamValue !== 'false'
  )

  const isMobileOrTabletWidth = useMediaQuery(`(max-width:${TABLET_MAX_WIDTH})`)

  if (isMobileOrTabletWidth) {
    return (
      <SwipeableDrawer
        anchor='bottom'
        open={open}
        onClose={() => redirect(getURL({ [openSearchParamKey]: null }))}
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
        <DialogContent>{children}</DialogContent>
      </SwipeableDrawer>
    )
  }
  return (
    <Dialog
      fullWidth
      maxWidth={maxWidth}
      open={open}
      onClose={() => redirect(getURL({ [openSearchParamKey]: null }))}>
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={() => redirect(getURL({ [openSearchParamKey]: null }))}
        className='absolute top-2 right-2'>
        <CloseIcon />
      </IconButton>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}
