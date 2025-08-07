'use server'

import mongoose from 'mongoose'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import connectDB from '@/lib/connectDB'
import { getPaginatedData } from '@/lib/pagination'
import { trackCreation, trackUpdates } from '@/lib/utils/auditLogUtils'
import { withAuth } from '@/lib/withAuth'
import CustomerShippingAddress from '@/models/CustomerShippingAddress'

import { AUTO_GENERATE_CUSTOMER_ID } from '../../appConfig'

async function getCustomerShippingAddresses({
  pageNumber = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  customerId,
  searchText = '',
}) {
  await connectDB()
  const shippingAddresses = await getPaginatedData(CustomerShippingAddress, {
    pageNumber,
    pageSize,
    filtersPipeline: [
      {
        $match: {
          customerId: AUTO_GENERATE_CUSTOMER_ID
            ? new mongoose.Types.ObjectId(customerId)
            : customerId,
        },
      },
      ...(searchText
        ? [
            {
              $match: {
                name: { $regex: searchText, $options: 'i' },
              },
            },
          ]
        : []),
    ],
    paginatedResultsPipeline: [
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ],
  })

  return { success: true, data: shippingAddresses }
}

async function getCustomerShippingAddress(customerShippingAddressId) {
  await connectDB()
  const shippingAddress = await CustomerShippingAddress.findById(
    customerShippingAddressId
  )

  if (shippingAddress) {
    return { success: true, data: shippingAddress.toJSON() }
  }
  return { success: false, error: 'Shipping Address not found!' }
}

async function createCustomerShippingAddress(shippingAddressReq) {
  await connectDB()

  try {
    const customerShippingAddress = new CustomerShippingAddress({
      customerId: shippingAddressReq?.customerId,
      name: shippingAddressReq?.name,
      address: shippingAddressReq?.address,
      gstin: shippingAddressReq?.gstin,
      phoneNumber: shippingAddressReq?.phoneNumber,
      emailId: shippingAddressReq?.emailId,
    })

    await customerShippingAddress.save()

    trackCreation({
      model: CustomerShippingAddress,
      documentId: customerShippingAddress._id,
      newDocument: customerShippingAddress.toJSON(),
    })

    return {
      success: true,
      data: 'customer Shipping Address created successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

async function editCustomerShippingAddress(
  shippingAddressId,
  shippingAddressReq
) {
  await connectDB()

  try {
    const shippingAddressFields = {
      name: shippingAddressReq?.name,
      address: shippingAddressReq?.address,
      gstin: shippingAddressReq?.gstin,
      phoneNumber: shippingAddressReq?.phoneNumber,
      emailId: shippingAddressReq?.emailId,
    }

    const oldShippingAddress = await CustomerShippingAddress.findByIdAndUpdate(
      shippingAddressId,
      shippingAddressFields,
      {
        runValidators: true,
      }
    )

    trackUpdates({
      model: CustomerShippingAddress,
      documentId: oldShippingAddress._id,
      oldDocument: oldShippingAddress.toJSON(),
      newDocument: shippingAddressFields,
    })

    return {
      success: true,
      data: 'Customer Shipping Address saved successfully!',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: e.message,
    }
  }
}

export const getCustomerShippingAddressesAction = withAuth(
  getCustomerShippingAddresses
)
export const getCustomerShippingAddressAction = withAuth(
  getCustomerShippingAddress
)
export const createCustomerShippingAddressAction = withAuth(
  createCustomerShippingAddress
)
export const editCustomerShippingAddressAction = withAuth(
  editCustomerShippingAddress
)
