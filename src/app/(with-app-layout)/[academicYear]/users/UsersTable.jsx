'use server'

import { getUsersAction } from '@/actions/userActions'
import DataTable from '@/components/common/DataTable'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import UsersTableActions from './UsersTableActions'

const usersTableColumns = {
  name: { label: 'Name' },
  emailId: { label: 'Email ID' },
  type: { label: 'Type' },
  actions: { label: 'Actions' },
}

export default async function UsersTable({ searchParams }) {
  const pageNumber = Number(searchParams?.pageNumber) || 0
  const pageSize = Number(searchParams?.pageSize) || DEFAULT_PAGE_SIZE

  const usersResponse = await getUsersAction(pageNumber, pageSize)

  return (
    <DataTable
      data={Object.fromEntries(
        usersResponse?.paginatedResults?.map((user) => [
          user?._id,
          {
            ...user,
            actions: (
              <UsersTableActions user={user} searchParams={searchParams} />
            ),
          },
        ])
      )}
      dataOrder={usersResponse?.paginatedResults?.map((user) => user?._id)}
      columns={usersTableColumns}
      totalCount={usersResponse?.totalCount}
    />
  )
}
