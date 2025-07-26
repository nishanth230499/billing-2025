'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { isSuperAdmin } from '@/lib/utils/userUtils'
import { withAuth } from '@/lib/withAuth'
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
  const dbEditorIgnoreFields = modelExports.dbEditorIgnoreFields

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

export const getDocumentsAction = withAuth(getDocuments)
