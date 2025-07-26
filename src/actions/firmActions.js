'use server'

import connectDB from '@/lib/connectDB'
import Firm from '@/models/Firm'

export default async function getFirmsAction() {
  await connectDB()

  const firms = await Firm.find({})
    .sort({
      _id: 1,
    })
    .lean()

  return firms
}
