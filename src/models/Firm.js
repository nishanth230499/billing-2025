import mongoose from 'mongoose'

import { modelConstants } from './constants'

const firmSchema = mongoose.Schema({
  _id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  color: { type: String, required: true },
  icon: { type: String, required: true },
})

const collectionName = 'firm'

export default mongoose.models?.[modelConstants?.[collectionName]?.modelName] ||
  mongoose.model(
    modelConstants?.[collectionName]?.modelName,
    firmSchema,
    collectionName
  )
