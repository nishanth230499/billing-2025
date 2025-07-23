'use server'

import mongoose from 'mongoose'

import { isAdmin } from '@/lib/utils/userUtils'

import { DEFAULT_PAGE_SIZE } from '../constants'
import { getPaginatedData } from '../lib/pagination'
import { withAuth } from '../lib/withAuth'
import AuditLog from '../models/AuditLog'

async function getAuditLogs(filters = {}, loggedinUser) {
  if (!isAdmin(loggedinUser)) {
    return {
      success: false,
      error: 'Only admins can request this.',
    }
  }
  const {
    pageNumber = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    updatedById = '',
    collectionName = '',
    documentId = '',
    startDateTime = '',
    endDateTime = '',
  } = filters

  const auditLogs = await getPaginatedData(AuditLog, {
    // TODO: Create indexes for the following filters
    filtersPipeline: [
      {
        $match: {
          ...(collectionName ? { collectionName } : {}),
          ...(documentId ? { documentId } : {}),
          ...(updatedById
            ? { updatedById: new mongoose.Types.ObjectId(updatedById) }
            : {}),
          ...(startDateTime || endDateTime
            ? {
                updatedAt: {
                  ...(startDateTime ? { $gte: new Date(startDateTime) } : {}),
                  ...(endDateTime ? { $lte: new Date(endDateTime) } : {}),
                },
              }
            : {}),
        },
      },
      { $sort: { updatedAt: -1 } },
    ],
    pageNumber,
    pageSize,
    paginatedResultsPipeline: [
      {
        $lookup: {
          from: 'user',
          localField: 'updatedById',
          foreignField: '_id',
          as: 'updatedBy',
        },
      },
      {
        $project: {
          collectionName: 1,
          documentId: 1,
          updatedFields: 1,
          updatedAt: 1,
          type: 1,
          updatedBy: { _id: 1, name: 1 },
        },
      },
      {
        $addFields: {
          updatedBy: {
            _id: { $toString: '$_id' },
          },
        },
      },
    ],
  })
  return { success: true, data: auditLogs }
}

async function getAuditLog(auditLogId, loggedinUser) {
  if (!isAdmin(loggedinUser)) {
    return {
      success: false,
      error: 'Only admins can request this.',
    }
  }

  const auditLog = await AuditLog.findOne({ _id: auditLogId }).lean()
  auditLog.updatedById = auditLog.updatedById.toString()
  auditLog._id = auditLog._id.toString()

  return { success: true, data: auditLog }
}

export const getAuditLogsAction = withAuth(getAuditLogs)
export const getAuditLogAction = withAuth(getAuditLog)
