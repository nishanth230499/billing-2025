'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '../constants'
import { getPaginatedData } from '../lib/pagination'
import { withAuth } from '../lib/withAuth'
import AuditLog from '../models/AuditLog'

async function getAuditLogs(filters = {}, loggedinUser) {
  if (loggedinUser?.type !== 'Admin') {
    return {
      success: false,
      error: 'Only admins can request this.',
    }
  }
  const {
    pageNumber = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    updatedById = '',
  } = filters

  const auditLogs = await getPaginatedData(AuditLog, {
    filters: updatedById
      ? [
          {
            $match: {
              updatedById: new mongoose.Types.ObjectId(updatedById),
            },
          },
        ]
      : [],
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
  if (loggedinUser?.type !== 'Admin') {
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
