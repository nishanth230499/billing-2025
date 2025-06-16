'use server'

import { getUsersAction } from '@/actions/userActions'
import DataTable from '@/components/common/DataTable'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export default async function UsersTable({
  pageSize = DEFAULT_PAGE_SIZE,
  pageNumber = 0,
}) {
  const usersResponse = await getUsersAction(pageNumber, pageSize)

  return (
    <DataTable
      data={Object.fromEntries(
        usersResponse?.paginatedResults?.map((user) => [user?._id, user])
      )}
      dataOrder={usersResponse?.paginatedResults?.map((user) => user?._id)}
      columns={{
        name: { label: 'Name' },
        emailId: { label: 'Email ID' },
        type: { label: 'Type' },
      }}
      totalCount={usersResponse?.totalCount}
    />
  )
}
