import mongoose from 'mongoose'

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
  },
  updatedAt: { type: Date, required: true, default: Date.now },
})

export default mongoose.models?.AuditLog ||
  mongoose.model('AuditLog', auditLogSchema, 'audit_log')
