import mongoose from 'mongoose'

import { modelConstants } from './constants'

const academicYearSchema = mongoose.Schema({
  year: { type: String, required: true, unique: true, index: true },
  default: Boolean,
})

academicYearSchema.index({ default: 1, year: -1 })

const collectionName = 'academic_year'

export default mongoose.models?.[modelConstants?.[collectionName]?.modelName] ||
  mongoose.model(
    modelConstants?.[collectionName]?.modelName,
    academicYearSchema,
    collectionName
  )
