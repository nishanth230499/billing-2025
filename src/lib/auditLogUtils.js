'use server'

import { diff } from 'json-diff'

import AuditLog from '@/models/AuditLog'

import { AuditLogType } from '../models/AuditLog'
import getLoggedinUserId from './getLoggedinUserId'

const ignoredFields = ['_id', '__v']
export async function trackUpdates({
  model,
  documentId,
  oldDocument,
  newDocument,
}) {
  const newFields = {}
  const oldFields = {}

  for (const key in newDocument) {
    if (!ignoredFields.includes(key)) {
      newFields[key] = newDocument[key]
      oldFields[key] = oldDocument[key]
    }
  }

  const differences = diff(oldFields, newFields)
  if (!differences) return

  const newLog = new AuditLog({
    collectionName: model.collection.collectionName,
    documentId: documentId.toString(),
    type: AuditLogType.UPDATED,
    updatedFields: differences,
    updatedById: await getLoggedinUserId(),
  })

  await newLog.save()
}

export async function trackCreation({ model, documentId, newDocument }) {
  const updatedFields = {}
  for (const key in newDocument) {
    if (!ignoredFields.includes(key)) {
      updatedFields[key] = newDocument[key]
    }
  }
  if (Object.keys(updatedFields).length === 0) return

  const newLog = new AuditLog({
    collectionName: model.collection.collectionName,
    documentId: documentId.toString(),
    type: AuditLogType.CREATED,
    updatedFields: updatedFields,
    updatedById: await getLoggedinUserId(),
  })
  await newLog.save()
}
