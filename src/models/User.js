import { emailRegex } from '@/lib/regex'
import mongoose from 'mongoose'

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
  type: { type: String, enum: ['Normal', 'Admin'], default: 'Normal' },
})

export default mongoose.models?.User ||
  mongoose.model('User', userSchema, 'user')
