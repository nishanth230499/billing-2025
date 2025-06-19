'use server'

import { Avatar, Box, Container, Typography } from '@mui/material'
import React from 'react'

import getFirmsAction from '@/actions/firmActions'

import LoginForm from './LoginForm'

export default async function Page() {
  const firms = await getFirmsAction()
  return (
    <Container component='main' maxWidth='xs'>
      <Box className='mt-2 flex flex-col items-center'>
        <Box className='flex m-2 gap-4'>
          {firms?.map((firm) => (
            <Avatar
              key={firm?._id}
              sx={{ border: `2px solid ${firm?.color}` }}
              src={`/logos/${firm?.icon}`}
              alt={`${firm?.name} Icon`}
            />
          ))}
        </Box>
        {firms?.map((firm) => (
          <Typography key={firm?._id} component='h1'>
            {firm?.name}
          </Typography>
        ))}
        <Typography component='h1' variant='h5' className='mt-4'>
          Billing Application
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  )
}
