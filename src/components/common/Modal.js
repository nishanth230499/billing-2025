'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from '@mui/material'

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
        <Backdrop
          open={isLoading}
          slotProps={{ root: { sx: { zIndex: 'loader' } } }}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </SwipeableDrawer>
    )
  }
  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={onClose}>
      <Backdrop
        open={isLoading}
        slotProps={{ root: { sx: { zIndex: 'loader' } } }}>
        <CircularProgress color='inherit' />
      </Backdrop>
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
