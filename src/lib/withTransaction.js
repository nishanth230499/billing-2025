import mongoose from 'mongoose'

export default async function withTransaction(operations) {
  const session = await mongoose.startSession()
  try {
    const res = await session.withTransaction(async () => {
      return await operations({ session })
    })
    return res
  } finally {
    session.endSession()
  }
}
