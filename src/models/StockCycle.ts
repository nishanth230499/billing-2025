import mongoose from 'mongoose'

import { modelConstants } from './constants'

const stockCycleSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, unique: true, index: true },
  default: Boolean,
})

stockCycleSchema.index({ default: 1, name: -1 })

const model = modelConstants.stock_cycle

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, stockCycleSchema, model?.collectionName)
