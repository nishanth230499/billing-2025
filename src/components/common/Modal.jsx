'use client'

import { MOBILE_MAX_WIDTH, TABLET_MAX_WIDTH } from '@/constants'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  SwipeableDrawer,
  useMediaQuery,
} from '@mui/material'
import { redirect } from 'next/navigation'
import { forwardRef, useMemo } from 'react'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

export default function Modal({ children, openSearchParamKey, title }) {
  const [searchParams, getURL] = useHandleSearchParams()

  const open = useMemo(() => searchParams.get(openSearchParamKey) === 'true')

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
              height: '90%',
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
      open={open}
      onClose={() => redirect(getURL({ [openSearchParamKey]: null }))}
      slots={{
        transition: Transition,
      }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}
