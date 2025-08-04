'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation, trackUpdates } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import withTransaction from '@/lib/withTransaction'
import Company from '@/models/Company'
import { modelConstants } from '@/models/constants'
import Item from '@/models/Item'

import { AUTO_GENERATE_COMPANY_ID } from '../../appConfig'

async function getCompanies({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  searchText = '',
  sortFields = {},
}) {
  await connectDB()
  const companies = await getPaginatedData(Company, {
    pageNumber,
    pageSize,
    filtersPipeline: [
      ...(searchText
        ? [
            {
              $search: {
                index: 'id_name_shortName_tags_searchIndex',
                compound: {
                  should: [
                    { autocomplete: { query: searchText, path: '_id' } },
                    {
                      autocomplete: {
                        query: searchText,
                        path: 'name',
                      },
                    },
                    {
                      autocomplete: {
                        query: searchText,
                        path: 'shortName',
                      },
                    },
                    { autocomplete: { query: searchText, path: 'tags' } },
                  ],
                },
              },
            },
          ]
        : []),
      ...(Object.keys(sortFields).length
        ? [
            {
              $sort: sortFields,
            },
          ]
        : []),
    ],
    paginatedResultsPipeline: [
      {
        $lookup: {
          from: modelConstants.firm.collectionName,
          localField: 'firmId',
          foreignField: '_id',
          as: 'firm',
        },
      },
      {
        $set: {
          firm: { $first: '$firm' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          'firm.color': 1,
        },
      },
    ],
  })

  return { success: true, data: companies }
}

async function getCompany(companyId) {
  await connectDB()
  const company = await Company.aggregate([
    {
      $match: {
        _id: AUTO_GENERATE_COMPANY_ID
          ? new mongoose.Types.ObjectId(companyId)
          : companyId,
      },
    },
    {
      $lookup: {
        from: modelConstants.firm.collectionName,
        localField: 'firmId',
        foreignField: '_id',
        as: 'firm',
      },
    },
    {
      $set: {
        firm: { $first: '$firm' },
      },
    },
  ])

  if (company[0]) {
    company[0]._id = company[0]._id.toString()
    return { success: true, data: company[0] }
  }
  return { success: false, error: 'User not found!' }
}

async function createCompany(companyReq) {
  await connectDB()

  try {
    const company = new Company({
      _id: AUTO_GENERATE_COMPANY_ID ? undefined : companyReq?._id,
      name: companyReq?.name,
      shortName: companyReq?.shortName,
      address: companyReq?.address,
      firmId: companyReq?.firmId,
      gstin: companyReq?.gstin,
      phoneNumber: companyReq?.phoneNumber,
      emailId: companyReq?.emailId,
      shippingAddress: companyReq?.shippingAddress,
      shippingPhoneNumber: companyReq?.shippingPhoneNumber,
      tags: companyReq?.tags,
    })

    await company.save()

    trackCreation({
      model: Company,
      documentId: company._id,
      newDocument: company.toObject(),
    })

    return {
      success: true,
      data: 'Company created successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

async function editCompany(companyId, companyReq) {
  await connectDB()

  try {
    const companyUpdateFields = {
      name: companyReq?.name,
      shortName: companyReq?.shortName,
      address: companyReq?.address,
      gstin: companyReq?.gstin,
      phoneNumber: companyReq?.phoneNumber,
      emailId: companyReq?.emailId,
      shippingAddress: companyReq?.shippingAddress,
      shippingPhoneNumber: companyReq?.shippingPhoneNumber,
      tags: companyReq?.tags,
    }

    const oldCompany = await withTransaction(async ({ session }) => {
      const oldCompany = await Company.findOneAndUpdate(
        {
          _id: AUTO_GENERATE_COMPANY_ID
            ? new mongoose.Types.ObjectId(companyId)
            : companyId,
        },
        companyUpdateFields,
        {
          runValidators: true,
          session,
        }
      ).lean()

      if (
        oldCompany?.name !== companyUpdateFields?.name ||
        oldCompany?.shortName !== companyUpdateFields?.shortName ||
        oldCompany?.tags !== companyUpdateFields?.tags
      ) {
        await Item.updateMany(
          {
            companyId: AUTO_GENERATE_COMPANY_ID
              ? new mongoose.Types.ObjectId(companyId)
              : companyId,
          },
          {
            $set: {
              company: {
                name: companyUpdateFields?.name,
                shortName: companyUpdateFields?.shortName,
                tags: companyUpdateFields?.tags,
              },
            },
          },
          { runValidators: true, session }
        )
      }
      return oldCompany
    })
    trackUpdates({
      model: Company,
      documentId: oldCompany._id,
      oldDocument: oldCompany,
      newDocument: companyUpdateFields,
    })

    return {
      success: true,
      data: 'Company saved successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

export const getCompaniesAction = withAuth(getCompanies)
export const getCompanyAction = withAuth(getCompany)
export const createCompanyAction = withAuth(createCompany)
export const editCompanyAction = withAuth(editCompany)
