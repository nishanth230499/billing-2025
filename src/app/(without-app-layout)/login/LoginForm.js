'use client'

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import React, { useCallback, useState } from 'react'

import { loginAction } from '@/actions/authActions'
import handleServerAction from '@/lib/handleServerAction'
import { emailRegex } from '@/lib/regex'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const { mutate: login, isPending: isLoginLoading } = useMutation({
    mutationFn: (data) => handleServerAction(loginAction, data),
  })

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
      login(
        { email, password },
        {
          onSuccess: (data) => {
            enqueueSnackbar(data, { variant: 'success' })
            router.push('/')
          },
          onError: (error) =>
            enqueueSnackbar(error.message, { variant: 'error' }),
        }
      )
    },
    [email, login, password, router]
  )
  return (
    <Box component='form' noValidate className='mt-0.5' onSubmit={handleSubmit}>
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
        loading={isLoginLoading}
        disabled={isLoginLoading}>
        Login
      </Button>
    </Box>
  )
}
