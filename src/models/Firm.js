import mongoose from 'mongoose'

import { modelConstants } from './constants'

const firmSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: {
      type: String,
      required: true,
    },
    color: { type: String, required: true },
    icon: { type: String, required: true },
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

const model = modelConstants.firm

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, firmSchema, model?.collectionName)
