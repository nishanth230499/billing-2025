'use client'

import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useMemo, useState } from 'react'

import { getUserAction, resetPasswordAction } from '@/actions/userActions'
import ErrorAlert from '@/components/common/ErrorAlert'
import { LOADING } from '@/constants'
import handleServerAction from '@/lib/handleServerAction'
import { passwordRegex } from '@/lib/regex'

export default function ResetPasswordForm() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const resettingPasswordUserId = useMemo(
    () => searchParams.get('reset_password_user'),
    [searchParams]
  )

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUserAction, resettingPasswordUserId),
    queryKey: ['getUserAction', resettingPasswordUserId],
    enabled: Boolean(resettingPasswordUserId),
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [passwordError, setPasswordError] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

  const confirmPasswordError = useMemo(
    () => confirmPasswordTouched && password !== confirmPassword,
    [confirmPassword, confirmPasswordTouched, password]
  )

  const { mutate: resetPassword, isPending: isResetPasswordLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(resetPasswordAction, ...data),
    })

  const handleClose = useCallback(() => {
    router.back()

    setPassword('')
    setConfirmPassword('')

    setPasswordError(false)
    setConfirmPasswordTouched(false)
  }, [router])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      let error = false

      if (!passwordRegex.test(password)) {
        setPasswordError(true)
        error = true
      }
      if (password !== confirmPassword) {
        setConfirmPasswordTouched(true)
        error = true
      }
      if (error) return
      resetPassword([userResponse?._id, password], {
        onSuccess: async (data) => {
          enqueueSnackbar(data, { variant: 'success' })
          handleClose()
        },
        onError: (error) =>
          enqueueSnackbar(error.message, { variant: 'error' }),
      })
    },
    [password, confirmPassword, resetPassword, userResponse?._id, handleClose]
  )

  return (
    <>
      {isUserLoading ? LOADING : null}
      <DialogContent hidden={isUserLoading}>
        <ErrorAlert isError={isUserError} error={userError}>
          <Box component='form' noValidate onSubmit={handleSubmit}>
            <input type='submit' hidden />
            <Grid container columnSpacing={2}>
              <Grid size={{ xs: 12, sm: 6 }} alignSelf='center'>
                <Typography>
                  Email: <strong>{userResponse?.emailId}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography>
                  Name: <strong>{userResponse?.name}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  label='Password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(!passwordRegex.test(e.target.value))
                  }}
                  error={passwordError}
                  helperText='Password must contain atleast 1 number, 1 small letter, 1 capital letter, 1 special character and must be 8 to 15 characters long.'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  label='Confirm Password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setConfirmPasswordTouched(true)
                  }}
                  error={confirmPasswordError}
                  helperText='Passwords should match'
                />
              </Grid>
            </Grid>
          </Box>
        </ErrorAlert>
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          type='submit'
          disabled={isResetPasswordLoading}
          loading={isResetPasswordLoading}
          onClick={handleSubmit}>
          Reset
        </Button>
      </DialogActions>
    </>
  )
}
