import mongoose from 'mongoose'

import { modelConstants } from './constants'

const hsnSchema = mongoose.Schema({
  _id: { type: String, required: true },
  sgstRate: {
    type: Number,
    required: true,
    min: [0, 'GST Rate can not be negative'],
  },
  cgstRate: {
    type: Number,
    required: true,
    min: [0, 'GST Rate can not be negative'],
  },
  igstRate: {
    type: Number,
    required: true,
    min: [0, 'GST Rate can not be negative'],
  },
})

const model = modelConstants.hsn

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, hsnSchema, model?.collectionName)
