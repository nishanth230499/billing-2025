'use server'

import { Alert, Box } from '@mui/material'
import { notFound } from 'next/navigation'

import { getLoggedinUserAction } from '@/actions/authActions'
import getFirmsAction from '@/actions/firmActions'
import { getStockCyclesAction } from '@/actions/stockCycleActions'
import AppDrawer from '@/components/AppDrawer'

export default async function Layout({ children, params }) {
  const { stockCycle: selectedStockCycle } = await params
  const [
    { success: isUserSucces, data: loggedinUser, error: userError },
    {
      success: isStockCyclesSuccess,
      data: stockCycles,
      error: stockCyclesError,
    },
    firms,
  ] = await Promise.all([
    getLoggedinUserAction(),
    getStockCyclesAction(),
    getFirmsAction(),
  ])

  if (!isUserSucces) {
    // TODO: Redirect to login or change password, based on the userError string
    return <Alert severity='error'>{userError}</Alert>
  }
  if (!isStockCyclesSuccess) {
    return <Alert severity='error'>{stockCyclesError}</Alert>
  }
  if (!stockCycles?.find(({ _id }) => _id === selectedStockCycle)) notFound()
  return (
    <Box className='flex'>
      <AppDrawer
        stockCycles={stockCycles}
        selectedStockCycle={selectedStockCycle}
        userName={loggedinUser?.name}
        userType={loggedinUser?.type}
        firms={firms}
      />
      <main className='min-w-0 w-full p-4 max-h-screen print:max-h-none flex flex-col'>
        {children}
      </main>
    </Box>
  )
}
