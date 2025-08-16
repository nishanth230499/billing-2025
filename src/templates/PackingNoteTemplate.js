import { Chip } from '@mui/material'
import { Fragment } from 'react'

import routes from '@/constants/routeConstants'
import { formatAmount } from '@/lib/utils/amoutUtils'
import { getFullItemName } from '@/lib/utils/itemUtils'

import TemplateLink from './TemplateLink'

export default function PackingNoteTemplate({
  customer,
  packingNote,
  stockCycleId,
  partial,
}) {
  return (
    <table className='w-full text-left'>
      <thead>
        <tr>
          <th colSpan={3}>GSTIN: {customer?.firm?.gstin}</th>
          <th colSpan={2} className='text-right underline'>
            {partial ? 'Partial Packing Note' : ''}
          </th>
        </tr>
        <tr>
          <th colSpan={5} className='text-center text-4xl'>
            {customer?.firm?.name}
          </th>
        </tr>
        <tr>
          <th colSpan={5} className='text-center'>
            {customer?.firm?.address}
          </th>
        </tr>
        <tr>
          <th colSpan={5} className='text-center'>
            Ph.: {customer?.firm?.phoneNumber}. Email: {customer?.firm?.emailId}
          </th>
        </tr>
        <tr>
          <th colSpan={5} className='text-center underline'>
            PACKING NOTE
          </th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th colSpan={3} rowSpan={5} className='border py-1 px-2'>
            <div className='flex flex-col'>
              <div className='font-normal'>Customer:</div>
              <div className='text-2xl ml-4'>{customer?.name}</div>
              <div className='ml-4 font-normal'>{customer?.billingName}</div>
              <div className='ml-4 font-normal'>{customer?.billingAddress}</div>
              <div className='ml-4 font-normal'>
                Ph. No.: {customer?.phoneNumber || '-'}. Email:{' '}
                {customer?.emailId || '-'}
              </div>
              <div className='ml-4 font-normal'>
                GSTIN: {customer?.gstin || 'URP'}
              </div>
            </div>
          </th>
          <th colSpan={2} className='border py-1 px-2 font-normal'>
            Printed Date:{' '}
            <span className='font-bold'>{new Date().toLocaleDateString()}</span>
          </th>
        </tr>
        <tr>
          <th colSpan={2} className='border py-1 px-2 font-normal'>
            Packing Date
          </th>
        </tr>
        <tr>
          <th colSpan={2} className='border py-1 px-2 font-normal'>
            No. of Bundles
          </th>
        </tr>
        <tr>
          <th colSpan={2} className='border py-1 px-2 font-normal'>
            Packed By
          </th>
        </tr>
        <tr>
          <th colSpan={2} className='border py-1 px-2 font-normal'>
            Checked By
          </th>
        </tr>
        <tr>
          <th className='border py-1 px-2'>Sl. No.</th>
          <th className='border py-1 px-2'>Item Id</th>
          <th className='border py-1 px-2'>Item</th>
          <th className='border py-1 px-2 text-right'>Qty.</th>
          <th className='border py-1 px-2 text-right'>Rate</th>
        </tr>
      </thead>
      <tbody>
        {packingNote?.map(
          ({ customerShippingAddress, orderRef, isSetPack, items }, ind) => (
            <Fragment key={ind}>
              <tr>
                <td colSpan={5} className='border py-1 px-2'>
                  {isSetPack && (
                    <Chip
                      label='Set Pack'
                      variant='outlined'
                      className='mr-2 h-auto'
                    />
                  )}
                  Order Ref:{' '}
                  <span className='font-bold'>{orderRef || '-'}</span>, Ship To:{' '}
                  {customerShippingAddress ? (
                    <>
                      <span className='font-bold'>
                        {customerShippingAddress?.name}
                      </span>
                      , {customerShippingAddress?.address}.{' '}
                      {customerShippingAddress?.phoneNumber
                        ? `Ph.: ${customerShippingAddress?.phoneNumber}`
                        : ''}
                    </>
                  ) : (
                    <span className='font-bold'>Original Address</span>
                  )}
                </td>
              </tr>
              {items.map(({ itemId, item, quantity }, j) => (
                <Fragment key={j}>
                  {Object.entries(quantity).map(([quantityFor, quantity]) =>
                    quantity ? (
                      <tr key={quantityFor}>
                        <td className='border py-1 px-2'>{j + 1}</td>
                        <td className='border py-1 px-2'>
                          <TemplateLink
                            href={routes.item.legend(stockCycleId, itemId)}>
                            {itemId}
                          </TemplateLink>
                        </td>
                        <td className='border py-1 px-2'>
                          {getFullItemName(item)}
                          {quantityFor === 'shipping' && (
                            <Chip
                              label='Only Item'
                              variant='outlined'
                              className='ml-2 h-auto'
                            />
                          )}
                          {quantityFor === 'invoice' && (
                            <Chip
                              label='Only Bill'
                              variant='outlined'
                              className='ml-2 h-auto'
                            />
                          )}
                        </td>
                        <td className='border py-1 px-2 text-right'>
                          {quantity}
                        </td>
                        <td className='border py-1 px-2 text-right opacity-50'>
                          {formatAmount(item?.price)}
                        </td>
                      </tr>
                    ) : null
                  )}
                </Fragment>
              ))}
            </Fragment>
          )
        )}
      </tbody>
    </table>
  )
}
