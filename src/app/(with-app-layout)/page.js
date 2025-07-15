'use server'

import { Alert } from '@mui/material'
import { redirect } from 'next/navigation'

import { getDefaultStockCycleAction } from '@/actions/stockCycleActions'

export default async function Page() {
  const {
    success,
    error: defaultStockCycleError,
    data: defaultStockCycle,
  } = await getDefaultStockCycleAction()
  if (!success) {
    return <Alert severity='error'>{defaultStockCycleError}</Alert>
  }
  if (defaultStockCycle?.name) redirect(`/${defaultStockCycle?.name}`)
  return null
}
