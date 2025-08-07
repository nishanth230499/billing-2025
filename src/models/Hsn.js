import mongoose from 'mongoose'

import { formatAmount } from '@/lib/utils/amoutUtils'

import { modelConstants } from './constants'

const hsnSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    sgstRate: {
      type: Number,
      required: true,
      min: [0, 'GST Rate can not be negative'],
      set: formatAmount,
    },
    cgstRate: {
      type: Number,
      required: true,
      min: [0, 'GST Rate can not be negative'],
      set: formatAmount,
    },
    igstRate: {
      type: Number,
      required: true,
      min: [0, 'GST Rate can not be negative'],
      set: formatAmount,
    },
  },
  {
    toJSON: {
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
      },
    },
  }
)

const model = modelConstants.hsn

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, hsnSchema, model?.collectionName)
