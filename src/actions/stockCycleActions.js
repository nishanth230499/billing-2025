'use server'

import connectDB from '@/lib/connectDB'
import { withAuth } from '@/lib/withAuth'
import StockCycle from '@/models/StockCycle'

async function getStockCycles() {
  await connectDB()
  console.log(' * Page Reloaded')
  const stockCycles = await StockCycle.find({}, { _id: 0 })
    .sort({
      name: 1,
    })
    .lean()

  return { success: true, data: stockCycles }
}

async function getDefaultStockCycle() {
  await connectDB()

  const defaultStockCycle = await StockCycle.find({ default: true }, { _id: 0 })
    .sort({ name: -1 })
    .limit(1)
    .lean()

  return { success: true, data: defaultStockCycle[0] }
}

export const getStockCyclesAction = withAuth(getStockCycles)
export const getDefaultStockCycleAction = withAuth(getDefaultStockCycle)
