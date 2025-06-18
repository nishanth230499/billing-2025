'use client'

import { createUserAction, editUserAction } from '@/actions/userActions'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import useServerAction from '@/hooks/useServerAction'
import { emailRegex, passwordRegex } from '@/lib/regex'
import { UserType } from '@/models/User'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { redirect, useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function CreateOrEditUserForm({ editingUser }) {
  const router = useRouter()
  const { getURL } = useHandleSearchParams()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [active, setActive] = useState(false)
  const [userType, setUserType] = useState(UserType.NORMAL)

  const [emailError, setEmailError] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [userTypeError, setUserTypeError] = useState(false)

  const confirmPasswordError = useMemo(
    () => confirmPasswordTouched && password !== confirmPassword,
    [confirmPassword, confirmPasswordTouched, password]
  )

  const [createUser, isCreateUserLoading] = useServerAction(createUserAction)
  const [editUser, isEditUserLoading] = useServerAction(editUserAction)

  useEffect(() => {
    if (editingUser) {
      setName(editingUser?.name)
      setActive(editingUser.active)
      setUserType(editingUser.type)
    } else {
      setName('')
      setActive(true)
      setUserType(UserType.NORMAL)
    }
  }, [editingUser, open])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      let error = false
      if (!name) {
        setNameError(true)
        error = true
      }
      if (!userType) {
        setUserTypeError(true)
        error = true
      }
      if (editingUser) {
        if (error) return
        const res = await editUser(editingUser?._id, {
          name,
          active,
          type: userType,
        })
        if (res?.success) {
          enqueueSnackbar(res?.message, { variant: 'success' })
          redirect(getURL({ edit_user: null }))
        } else {
          enqueueSnackbar(res?.message, { variant: 'error' })
        }
      } else {
        if (!emailRegex.test(email)) {
          setEmailError(true)
          error = true
        }

        if (!passwordRegex.test(password)) {
          setPasswordError(true)
          error = true
        }
        if (password !== confirmPassword) {
          setConfirmPasswordTouched(true)
          error = true
        }
        if (error) return
        const res = await createUser({
          name,
          password,
          emailId: email,
          active,
          type: userType,
        })
        if (res?.success) {
          enqueueSnackbar(res?.message, { variant: 'success' })
          redirect(getURL({ create: null }))
        } else {
          enqueueSnackbar(res?.message, { variant: 'error' })
        }
      }
    },
    [name, email, password, active, userType, getURL]
  )

  return (
    <>
      <DialogContent>
        <Box component='form' noValidate onSubmit={handleSubmit}>
          <input type='submit' hidden />
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }} alignSelf='center'>
              {editingUser ? (
                <Typography>
                  Email: <strong>{editingUser?.emailId}</strong>
                </Typography>
              ) : (
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  label='Email'
                  name='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(!emailRegex.test(e.target.value))
                  }}
                  error={emailError}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                margin='normal'
                required
                fullWidth
                autoFocus
                label='Name'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(!e.target.value)
                }}
                error={nameError}
              />
            </Grid>
            {!editingUser && (
              <>
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
              </>
            )}

            <Grid size={{ xs: 6 }}>
              <TextField
                margin='normal'
                required
                fullWidth
                label='User Type'
                select
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value)
                  setUserTypeError(e.target.value === '')
                }}
                error={userTypeError}>
                {Object.values(UserType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }} alignSelf='center'>
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                }
                label='Active'
                labelPlacement='start'
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions className='px-6 pb-5'>
        <Button onClick={() => router.back()}>Cancel</Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          type='submit'
          disabled={isCreateUserLoading || isEditUserLoading}
          loading={isCreateUserLoading || isEditUserLoading}
          onClick={handleSubmit}>
          {editingUser ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </>
  )
}
