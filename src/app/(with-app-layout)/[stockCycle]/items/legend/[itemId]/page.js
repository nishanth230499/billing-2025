'use client'

import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

export default function Page() {
  //   TODO: Build Item Legend here
  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Item Legend</Typography>
      </Box>
    </Paper>
  )
}
