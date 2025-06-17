'use client'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material'
import { redirect } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import React, { useCallback, useState } from 'react'

import { loginAction } from '@/actions/authActions'
import useServerAction from '@/hooks/useServerAction'
import { emailRegex } from '@/lib/regex'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const [login, loginLoading] = useServerAction(loginAction)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      let error = false
      if (!emailRegex.test(email)) {
        setEmailError(true)
        error = true
      }
      if (password === '') {
        setPasswordError(true)
        error = true
      }

      if (error) return
      const res = await login({ email, password })
      if (res?.success) {
        enqueueSnackbar(res?.message, { variant: 'success' })
        redirect('/')
      } else {
        res?.errors?.forEach(({ message }) =>
          enqueueSnackbar(message, { variant: 'error' })
        )
      }
    },
    [email, login, password]
  )

  return (
    <Container component='main' maxWidth='xs'>
      <Box className='mt-2 flex flex-col items-center'>
        <Box className='flex m-2 gap-4'>
          <Avatar src='https://lh3.googleusercontent.com/a/ACg8ocIRCsd8SrY92ohtV7FAiX2Xm5gydzTo5V4OcsDkiWTtbj8l8t1M=s288-c-no' />
          <Avatar src='https://lh3.googleusercontent.com/a/ACg8ocL_UzuRNE07fm1oTzTxdWvLlLUOVaewORhWo4jgOIdxOYJj9w=s288-c-no' />
          <Avatar src='https://lh3.googleusercontent.com/a/ACg8ocJKNw1Ycyf8irfjZSkOUN5oskeE5izE5t2oFynam2t7cb5yOms=s288-c-no' />
        </Box>
        <Typography component='h1'>Neeladri Books</Typography>
        <Typography component='h1'>Samruddhi Books</Typography>
        <Typography component='h1'>Samruddhi Publishers</Typography>
        <Typography component='h1' variant='h5' className='mt-4'>
          Billing Application
        </Typography>
        <Box
          component='form'
          noValidate
          className='mt-0.5'
          onSubmit={handleSubmit}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError(!emailRegex.test(e.target.value))
            }}
            error={emailError}
          />
          <FormControl fullWidth margin='normal' required variant='outlined'>
            <InputLabel htmlFor='password'>Password</InputLabel>
            <OutlinedInput
              label='Password'
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(e.target.value === '')
              }}
              error={passwordError}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            className='mt-1 mb-0.5'
            loading={loginLoading}
            disabled={loginLoading}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
