import mongoose from 'mongoose'

import { modelConstants } from './constants'

const hsnSchema = mongoose.Schema({
  _id: { type: String, required: true },
  sgstRate: {
    type: Number,
    required: true,
  },
  cgstRate: {
    type: Number,
    required: true,
  },
  igstRate: { type: Number, required: true },
})

const model = modelConstants.hsn

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, hsnSchema, model?.collectionName)
