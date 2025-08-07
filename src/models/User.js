import mongoose from 'mongoose'

import { emailRegex } from '@/lib/regex'

import { modelConstants } from './constants'

export const UserType = Object.freeze({
  NORMAL: 'Normal',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
})

const userSchema = mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      index: 1,
      match: [emailRegex, 'Invalid email id!'],
    },
    name: { type: String, required: true },
    hashedPassword: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date },
    changePasswordRequired: { type: Boolean, required: true, default: true },
    type: {
      type: String,
      enum: Object.values(UserType),
      default: UserType.NORMAL,
    },
    active: { type: Boolean, default: true },
  },
  {
    toJSON: {
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
        ret._id = ret?._id?.toString()
        delete ret.hashedPassword
        ret.passwordChangedAt = ret?.passwordChangedAt?.toISOString()
      },
    },
  }
)

userSchema.statics.dbEditorIgnoreFields = ['hashedPassword']

const model = modelConstants.user

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, userSchema, model?.collectionName)
