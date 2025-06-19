'use client'

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  SwipeableDrawer,
  useMediaQuery,
} from '@mui/material'
import { useEffect, useState } from 'react'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import classNames from 'classnames'
import AppDrawerContents from './AppDrawerContents'
import { TABLET_MAX_WIDTH } from '@/constants'

export default function AppDrawer({
  academicYears,
  selectedAcademicYear,
  userName,
  userType,
  firms,
}) {
  const [isDrawerOpen, setisDrawerOpen] = useState(false)
  const [isMouseInsideDrawer, setIsMouseInsideDrawer] = useState(false)
  const [mouseTimerId, setMouseTimerId] = useState(null)

  useEffect(() => {
    return () => {
      if (mouseTimerId) {
        clearTimeout(setMouseTimerId)
      }
    }
  }, [mouseTimerId])

  const isMobileOrTabletWidth = useMediaQuery(`(max-width:${TABLET_MAX_WIDTH})`)

  if (isMobileOrTabletWidth)
    return (
      <>
        <SwipeableDrawer
          anchor='left'
          open={isDrawerOpen}
          onClose={() => setisDrawerOpen(false)}
          onOpen={() => setisDrawerOpen(true)}
          slotProps={{ paper: { className: 'max-h-screen w-3xs' } }}>
          <Box className='flex justify-around p-3'>
            {firms?.map((firm) => (
              <Avatar
                key={firm?._id}
                sx={{ border: `2px solid ${firm?.color}` }}
                src={`/logos/${firm?.icon}`}
                alt={`${firm?.name} Icon`}
              />
            ))}
          </Box>
          <Divider />
          <AppDrawerContents
            isDrawerExpanded
            academicYears={academicYears}
            selectedAcademicYear={selectedAcademicYear}
            userName={userName}
            userType={userType}
          />
        </SwipeableDrawer>
        <Paper
          elevation={16}
          sx={{
            transition: isDrawerOpen
              ? 'left 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
              : 'left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          }}
          className={classNames(
            'fixed bottom-4 z-[1201] rounded-l-none rounded-r-3xl',
            {
              'left-64 shadow-none': isDrawerOpen,
              'left-0': !isDrawerOpen,
            }
          )}>
          <IconButton onClick={() => setisDrawerOpen(!isDrawerOpen)}>
            {isDrawerOpen ? (
              <KeyboardArrowLeftIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </IconButton>
        </Paper>
      </>
    )
  const isDrawerExpanded = isDrawerOpen || isMouseInsideDrawer
  return (
    <Drawer
      variant='permanent'
      slotProps={{
        paper: {
          elevation: 1,
          className: classNames('h-screen max-h-screen sticky', {
            'w-3xs': isDrawerExpanded,
            'w-16': !isDrawerExpanded,
          }),
          sx: {
            transition: isDrawerExpanded
              ? 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
              : 'width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          },
        },
      }}>
      <Box
        className={classNames('p-3 flex items-center justify-between', {
          'flex-row': isDrawerOpen,
          'flex-row-reverse': !isDrawerOpen,
        })}>
        {isDrawerExpanded && (
          <Box className='flex gap-4'>
            {firms?.map((firm) => (
              <Avatar
                key={firm?._id}
                sx={{ border: `2px solid ${firm?.color}` }}
                src={`/logos/${firm?.icon}`}
                alt={`${firm?.name} Icon`}
              />
            ))}
          </Box>
        )}
        <IconButton onClick={() => setisDrawerOpen(!isDrawerOpen)}>
          {isDrawerOpen ? (
            <KeyboardArrowLeftIcon />
          ) : (
            <KeyboardArrowRightIcon />
          )}
        </IconButton>
      </Box>
      <Divider />
      <Box
        className='flex flex-col flex-auto overflow-hidden'
        // onMouseEnter={() => {
        //   setMouseTimerId(
        //     setTimeout(() => {
        //       setIsMouseInsideDrawer(true)
        //     }, 300)
        //   )
        // }}
        // onMouseLeave={() => {
        //   if (mouseTimerId) {
        //     clearTimeout(mouseTimerId)
        //     setMouseTimerId(null)
        //   }
        //   setIsMouseInsideDrawer(false)
        // }}
      >
        <AppDrawerContents
          isDrawerExpanded={isDrawerExpanded}
          academicYears={academicYears}
          selectedAcademicYear={selectedAcademicYear}
          userName={userName}
          userType={userType}
        />
      </Box>
    </Drawer>
  )
}
