const { default: connectDB } = require('@/lib/connectDB')
const { default: Firm } = require('@/models/Firm')

export default async function getFirmsAction() {
  await connectDB()

  const firms = await Firm.find({})
    .sort({
      _id: 1,
    })
    .lean()

  return firms
}
