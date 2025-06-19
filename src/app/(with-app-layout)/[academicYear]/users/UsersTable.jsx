'use client'

import DataTable from '@/components/common/DataTable'
import UsersTableActions from './UsersTableActions'
import { useQuery } from '@tanstack/react-query'
import { getUsersAction } from '@/actions/userActions'
import handleServerAction from '@/lib/handleServerAction'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import TableSkeleton from '@/components/TableSkeleton'

export default function UsersTable() {
  return <></>
}
