'use server'

import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

export default async function Page() {
  return (
    <Paper className='overflow-auto h-full flex flex-col p-4'>
      <Box className='flex items-center justify-between mb-4'>
        <Typography variant='h6'>Home Page</Typography>
      </Box>
    </Paper>
  )
}
