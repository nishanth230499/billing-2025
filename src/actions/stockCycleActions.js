'use server'

import connectDB from '@/lib/connectDB'
import { withAuth } from '@/lib/withAuth'
import StockCycle from '@/models/StockCycle'

async function getStockCycles() {
  await connectDB()
  console.log(' * Page Reloaded')
  const stockCycles = await StockCycle.find({})
    .sort({
      name: 1,
    })
    .exec()

  return { success: true, data: stockCycles.map((s) => s.toJSON()) }
}

async function getDefaultStockCycle() {
  await connectDB()

  const defaultStockCycle = await StockCycle.findOne({ default: true })
    .sort({ name: -1 })
    .exec()

  if (defaultStockCycle)
    return { success: true, data: defaultStockCycle.toJSON() }
  return { success: false, error: 'No default Stock Cycle Found.' }
}

export const getStockCyclesAction = withAuth(getStockCycles)
export const getDefaultStockCycleAction = withAuth(getDefaultStockCycle)
