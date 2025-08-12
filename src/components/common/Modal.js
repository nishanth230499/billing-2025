'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Dialog,
  DialogTitle,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import Loader from './Loader'

export default function Modal({
  title,
  children,
  open,
  onClose,
  isLoading,
  maxWidth = 'md',
}) {
  const theme = useTheme()
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobileWidth) {
    return (
      <SwipeableDrawer
        anchor='bottom'
        open={open}
        onClose={onClose}
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
        <Loader loading={isLoading} />
        <DialogTitle>{title}</DialogTitle>
        {children}
      </SwipeableDrawer>
    )
  }
  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={onClose}>
      <Loader loading={isLoading} />
      <IconButton
        aria-label='close'
        onClick={onClose}
        className='absolute top-2 right-2'>
        <CloseIcon />
      </IconButton>
      <DialogTitle>{title}</DialogTitle>
      {children}
    </Dialog>
  )
}
