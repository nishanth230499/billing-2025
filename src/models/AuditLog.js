import mongoose from 'mongoose'

import { modelConstants } from './constants'

export const AuditLogType = Object.freeze({
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
})

const auditLogSchema = mongoose.Schema({
  collectionName: {
    type: String,
    required: true,
  },
  documentId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(AuditLogType),
    required: true,
  },
  updatedFields: { type: Object, required: true },
  updatedById: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: 1,
  },
})

const collectionName = 'audit_log'

export default mongoose.models?.[modelConstants?.[collectionName]?.modelName] ||
  mongoose.model(
    modelConstants?.[collectionName]?.modelName,
    auditLogSchema,
    collectionName
  )
