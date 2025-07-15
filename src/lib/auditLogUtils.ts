'use server'

import { diff } from 'json-diff'
import { Model, Schema } from 'mongoose'

import AuditLog from '@/models/AuditLog'

import { AuditLogType } from '../models/AuditLog'
import getLoggedinUserId from './getLoggedinUserId'

const ignoredFields = ['_id', '__v']

interface ITrackParams {
  model: Model<any>
  documentId: Schema.Types.ObjectId | string
}

interface ITrackUpdatesParams extends ITrackParams {
  oldDocument: { [key: string]: any }
  newDocument: { [key: string]: any }
}

export async function trackUpdates({
  model,
  documentId,
  oldDocument,
  newDocument,
}: ITrackUpdatesParams): Promise<undefined> {
  const newFields: { [key: string]: any } = {}
  const oldFields: { [key: string]: any } = {}

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

interface ITrackCreationParams extends ITrackParams {
  newDocument: { [key: string]: any }
}

export async function trackCreation({
  model,
  documentId,
  newDocument,
}: ITrackCreationParams): Promise<undefined> {
  const updatedFields: { [key: string]: any } = {}
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

interface ITrackDeletionParams extends ITrackParams {
  oldDocument: { [key: string]: any }
}

export async function trackDeletion({
  model,
  documentId,
  oldDocument,
}: ITrackDeletionParams) {
  const deletedFields: { [key: string]: any } = {}
  for (const key in oldDocument) {
    if (!ignoredFields.includes(key)) {
      deletedFields[key] = oldDocument[key]
    }
  }
  if (Object.keys(deletedFields).length === 0) return

  const newLog = new AuditLog({
    collectionName: model.collection.collectionName,
    documentId: documentId.toString(),
    type: AuditLogType.DELETED,
    updatedFields: deletedFields,
    updatedById: await getLoggedinUserId(),
  })
  await newLog.save()
}
