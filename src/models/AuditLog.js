import mongoose from 'mongoose'

const auditLogSchema = mongoose.Schema({
  collectionName: {
    type: String,
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  updatedFields: { type: Object, required: true },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  updatedAt: { type: Date, required: true, default: Date.now },
})

export default mongoose.models?.AuditLog ||
  mongoose.model('AuditLog', auditLogSchema, 'audit_log')
