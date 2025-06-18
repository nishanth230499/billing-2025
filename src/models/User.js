import mongoose from 'mongoose'

import { emailRegex } from '@/lib/regex'

export const UserType = Object.freeze({
  NORMAL: 'Normal',
  ADMIN: 'Admin',
})

const userSchema = mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
    index: 1,
    match: [emailRegex, 'Invalid email id!'],
  },
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  passwordChangedAt: { type: Date },
  type: {
    type: String,
    enum: Object.values(UserType),
    default: UserType.NORMAL,
  },
  active: { type: Boolean, default: true },
})

export default mongoose.models?.User ||
  mongoose.model('User', userSchema, 'user')
