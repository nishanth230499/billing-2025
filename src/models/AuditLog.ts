/* eslint-disable no-unused-vars */
import mongoose from 'mongoose'

import { modelConstants } from './constants'

export enum AuditLogType {
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
}

const auditLogSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
    },
    documentId: {
      type: String,
      required: true,
      index: 1,
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
      ref: modelConstants.user.modelName,
      index: 1,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: 1,
    },
  },
  {
    toJSON: {
      transform: function (_, ret) {
        delete ret.id
        delete ret.__v
        ret._id = ret?._id?.toString()
        ret.updatedById = ret?.updatedById?.toString()
        ret.updatedAt = ret?.updatedAt?.toISOString()
      },
    },
  }
)

const model = modelConstants.audit_log

export default mongoose.models?.[model?.modelName] ||
  mongoose.model(model?.modelName, auditLogSchema, model?.collectionName)
