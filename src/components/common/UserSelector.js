'use client'

import { Alert, Autocomplete, TextField } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

import { getUserAction, getUsersAction } from '../../actions/userActions'
import { LOADING } from '../../constants'

export default function UserSelector() {
  const { getURL, searchParams } = useHandleSearchParams()

  const selectedUserId = useMemo(
    () => searchParams.get('selectedUser') ?? '',
    [searchParams]
  )

  const [inputValue, setInputValue] = useState('')
  const [searchKey] = useDebounce(inputValue, 1000)
  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUsersAction, { searchKey }),
    queryKey: [searchKey],
  })

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUserAction, selectedUserId),
    queryKey: [selectedUserId],
    enabled: Boolean(selectedUserId),
  })

  if (isUsersError) return <Alert severity='error'>{usersError.message}</Alert>

  if (isUserError) return <Alert severity='error'>{userError.message}</Alert>

  return (
    <Autocomplete
      loading={isUsersLoading}
      inputValue={inputValue ?? ''}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') setInputValue(val)
        if (reason === 'blur') setInputValue(userResponse?.name)
      }}
      value={selectedUserId}
      onChange={(_, option) => {
        window.history.replaceState(
          {},
          '',
          getURL({ selectedUser: option?.key })
        )
        setInputValue(option?.label)
      }}
      options={
        usersResponse?.paginatedResults?.map((user) => ({
          key: user?._id,
          label: user?.name,
        })) || []
      }
      getOptionKey={(option) => option?.key}
      renderInput={({ value, ...params }) => (
        <TextField
          {...params}
          label='Search for Users'
          value={isUserLoading ? LOADING : value}
        />
      )}
      isOptionEqualToValue={(option, value) => option?.key === value}
      noOptionsText='No Users Found'
      filterOptions={(options) => options}
    />
  )
}
