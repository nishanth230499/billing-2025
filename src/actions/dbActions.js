'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackUpdates } from '@/lib/utils/auditLogUtils'
import { isSuperAdmin } from '@/lib/utils/userUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import * as models from '@/models'
import { modelConstants } from '@/models/constants'

async function getDocuments(
  collectionName,
  { pageNumber = 0, pageSize = DEFAULT_PAGE_SIZE, filter = {} },
  loggedinUser
) {
  await connectDB()

  if (!isSuperAdmin(loggedinUser)) {
    return {
      success: false,
      error: 'Only super admins can request this.',
    }
  }
  if (!(collectionName in modelConstants)) {
    return {
      success: false,
      error: 'Collection does not exist.',
    }
  }
  if (collectionName === modelConstants.audit_log.collectionName) {
    return {
      success: false,
      error: 'Documents from this collection cannot be requested.',
    }
  }
  const modelExports = models[modelConstants?.[collectionName].modelName]
  const model = modelExports.default
  const dbEditorIgnoreFields = model.dbEditorIgnoreFields ?? []

  const objectIdFields = new Set(
    Object.entries({
      ...model.schema.paths,
      ...model.schema.subpaths,
    })
      .filter(([, schema]) => schema?.instance === 'ObjectId')
      .map(([fieldName]) => fieldName)
  )

  const filtersWithObjectId = Object.fromEntries(
    Object.entries(filter).map(([key, value]) => [
      key,
      typeof value === 'string' && objectIdFields.has(key)
        ? new mongoose.Types.ObjectId(value)
        : value,
    ])
  )

  const documents = await getPaginatedData(model, {
    filtersPipeline: [
      {
        $match: filtersWithObjectId,
      },
    ],
    pageNumber,
    pageSize,
    paginatedResultsPipeline: [
      ...(objectIdFields.size
        ? [
            {
              $addFields: Object.fromEntries(
                [...objectIdFields].map((fieldName) => [
                  fieldName,
                  { $toString: `$${fieldName}` },
                ])
              ),
            },
          ]
        : []),
      {
        $project: { __v: 0 },
      },
      ...(Array.isArray(dbEditorIgnoreFields) && dbEditorIgnoreFields.length
        ? [
            {
              $project: Object.fromEntries(
                dbEditorIgnoreFields?.map((fieldName) => [fieldName, 0]) ?? []
              ),
            },
          ]
        : []),
    ],
  })
  return { success: true, data: documents }
}

async function getDocument(collectionName, documentId, loggedinUser) {
  await connectDB()

  if (!isSuperAdmin(loggedinUser)) {
    return {
      success: false,
      error: 'Only super admins can request this.',
    }
  }
  if (!(collectionName in modelConstants)) {
    return {
      success: false,
      error: 'Collection does not exist.',
    }
  }
  if (collectionName === modelConstants.audit_log.collectionName) {
    return {
      success: false,
      error: 'Documents from this collection cannot be requested.',
    }
  }
  const modelExports = models[modelConstants?.[collectionName].modelName]
  const model = modelExports.default
  const dbEditorIgnoreFields = model.dbEditorIgnoreFields ?? []

  const document = (await model.findById(documentId)).toJSON()
  if (document) {
    dbEditorIgnoreFields?.forEach((fieldName) => {
      delete document[fieldName]
    })
    return { success: true, data: document }
  }

  return { success: false, error: 'Document not found!' }
}

async function editDocument(
  collectionName,
  documentId,
  documentReq,
  loggedinUser
) {
  await connectDB()

  if (!isSuperAdmin(loggedinUser)) {
    return {
      success: false,
      error: 'Only super admins can edit this.',
    }
  }
  if (!(collectionName in modelConstants)) {
    return {
      success: false,
      error: 'Collection does not exist.',
    }
  }
  if (collectionName === modelConstants.audit_log.collectionName) {
    return {
      success: false,
      error: 'Documents from this collection cannot be requested.',
    }
  }
  try {
    const modelExports = models[modelConstants?.[collectionName].modelName]
    const model = modelExports.default
    const dbEditorIgnoreFields = model.dbEditorIgnoreFields ?? []

    dbEditorIgnoreFields?.forEach((formField) => {
      delete documentReq[formField]
    })

    if (model?.schema?.methods?.normalizer) {
      const { oldDocumentJSON, newDocumentJSON } = await withTransaction(
        async ({ session }) => {
          const document = await model
            .findById(documentId)
            .session(session)
            .exec()

          const oldDocument = document.toObject()
          const oldDocumentJSON = document.toJSON()

          Object.assign(document, documentReq)
          await document.normalizer(oldDocument, session)
          await document.save({ session })

          const newDocumentJSON = document.toJSON()

          return { oldDocumentJSON, newDocumentJSON }
        }
      )

      trackUpdates({
        model,
        documentId: documentId,
        oldDocument: oldDocumentJSON,
        newDocument: newDocumentJSON,
      })
    } else {
      const oldDocument = await model.findByIdAndUpdate(
        documentId,
        documentReq,
        {
          runValidators: true,
        }
      )

      trackUpdates({
        model,
        documentId: documentId,
        oldDocument: oldDocument.toJSON(),
        newDocument: documentReq,
      })
    }

    return {
      success: true,
      data: 'Document saved successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

export const getDocumentsAction = withAuth(getDocuments)
export const getDocumentAction = withAuth(getDocument)
export const editDocumentAction = withAuth(editDocument)
