import mongoose from 'mongoose'

import { modelConstants } from './constants'

const stockCycleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  default: Boolean,
})

stockCycleSchema.index({ default: 1, name: -1 })

const collectionName = 'stock_cycle'

export default mongoose.models?.[modelConstants?.[collectionName]?.modelName] ||
  mongoose.model(
    modelConstants?.[collectionName]?.modelName,
    stockCycleSchema,
    collectionName
  )
