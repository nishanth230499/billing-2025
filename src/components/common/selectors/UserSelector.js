'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import { getUserAction, getUsersAction } from '@/actions/userActions'
import handleServerAction from '@/lib/handleServerAction'

import AutoComplete from '../AutoComplete'
import ErrorAlert from '../ErrorAlert'

export default function UserSelector({ selectedUserId, setSelectedUserId }) {
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
    queryKey: ['getUsersAction', searchKey],
  })

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryFn: async () =>
      await handleServerAction(getUserAction, selectedUserId),
    queryKey: ['getUserAction', selectedUserId],
    enabled: Boolean(selectedUserId),
  })

  return (
    <ErrorAlert isError={isUsersError} error={usersError}>
      <ErrorAlert isError={isUserError} error={userError}>
        <AutoComplete
          loading={isUsersLoading || isUserLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedKey={selectedUserId}
          selectedLabel={userResponse?.name ?? ''}
          setSelectedKey={setSelectedUserId}
          options={
            usersResponse?.paginatedResults?.map((user) => ({
              key: user?._id,
              label: user?.name,
            })) || []
          }
          placeholder='Search for Users'
          noOptionsText='No Users Found'
        />
      </ErrorAlert>
    </ErrorAlert>
  )
}
