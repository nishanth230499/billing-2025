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
  { autoSearchIndex: true }
)

userSchema.searchIndex({
  name: 'name_search_index',
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        name: [
          {
            type: 'token',
          },
          {
            type: 'string',
          },
          {
            foldDiacritics: false,
            maxGrams: 7,
            minGrams: 3,
            tokenization: 'edgeGram',
            type: 'autocomplete',
          },
        ],
        plot: [
          {
            type: 'autocomplete',
            tokenization: 'edgeGram',
            minGrams: 2,
            maxGrams: 15,
            foldDiacritics: true,
          },
        ],
      },
    },
  },
})

export const dbEditorIgnoreFields = ['hashedPassword']

const model = modelConstants.user

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, userSchema, model?.collectionName)
