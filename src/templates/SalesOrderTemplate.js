import { getFullItemName } from '@/lib/utils/itemUtils'

export default function SalesOrderTemplate({ salesOrder }) {
  return (
    <table className='w-full text-left'>
      <thead>
        <tr>
          <th colSpan={6}>GSTIN: {salesOrder?.customer?.firm?.gstin}</th>
        </tr>
        <tr>
          <th colSpan={6} className='text-center text-4xl'>
            {salesOrder?.customer?.firm?.name}
          </th>
        </tr>
        <tr>
          <th colSpan={6} className='text-center'>
            {salesOrder?.customer?.firm?.address}
          </th>
        </tr>
        <tr>
          <th colSpan={6} className='text-center'>
            Ph.: {salesOrder?.customer?.firm?.phoneNumber}. Email:{' '}
            {salesOrder?.customer?.firm?.emailId}
          </th>
        </tr>
        <tr>
          <th colSpan={6} className='text-center underline'>
            SALES ORDER
          </th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th colSpan={3} rowSpan={3} className='border p-2'>
            <div className='flex flex-col'>
              <div className='font-normal'>From,</div>
              <div className='text-2xl ml-4'>{salesOrder?.customer?.name}</div>
              <div className='ml-4 font-normal'>
                {salesOrder?.customer?.place}
              </div>
              {/* TODO: Populate these fields, after fixing customer model */}
              <div className='ml-4 font-normal'>Address</div>
              <div className='ml-4 font-normal'>Phone Number Email Id</div>
              <div className='ml-4 font-normal'>GSTIN</div>
            </div>
          </th>
          <th className='border p-2 font-normal'>Order No.</th>
          <th colSpan={2} className='border p-2'>
            {salesOrder?.number}
          </th>
        </tr>
        <tr>
          <th className='border p-2 font-normal'>Order Date.</th>
          <th colSpan={2} className='border p-2'>
            {salesOrder?.date}
          </th>
        </tr>
        <tr>
          <th className='border p-2 font-normal'>Ref.</th>
          <th colSpan={2} className='border p-2'>
            {salesOrder?.orderRef}
          </th>
        </tr>
        {/* <tr>
          <th className='border p-2 font-normal'>Set Pack</th>
          <th colSpan={2} className='border p-2'>
            {salesOrder?.isSetPack ? 'Yes' : 'No'}
          </th>
        </tr>
        <tr>
          <th className='border p-2 font-normal'>Supply Date</th>
          <th colSpan={2} className='border p-2'>
            {salesOrder?.supplyDate}
          </th>
        </tr> */}
        {salesOrder?.customerShippingAddress && (
          <tr>
            <th colSpan={6} className='border p-2 font-normal'>
              Ship To:{' '}
              <span className='font-bold'>
                {salesOrder?.customerShippingAddress?.name}
              </span>
              , {salesOrder?.customerShippingAddress?.address}.{' '}
              {salesOrder?.customerShippingAddress?.phoneNumber
                ? `Ph.: ${salesOrder?.customerShippingAddress?.phoneNumber}`
                : ''}
            </th>
          </tr>
        )}
        <tr>
          <th className='border p-2'>Sl. No.</th>
          <th className='border p-2'>Item Id</th>
          <th className='border p-2'>Item</th>
          <th className='border p-2'>Group</th>
          <th className='border p-2 text-right'>Qty.</th>
          <th className='border p-2 text-right'>Unit Qty.</th>
        </tr>
      </thead>
      <tbody>
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        {salesOrder?.items?.map((item, i) => (
          <tr key={i}>
            <td className='border p-2'>{i + 1}</td>
            <td className='border p-2'>{item?.itemId}</td>
            <td className='border p-2'>{getFullItemName(item.item)}</td>
            <td className='border p-2'>{item?.group}</td>
            <td className='border p-2 text-right'>{item?.quantity}</td>
            <td className='border p-2 text-right'>{item?.unitQuantity}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={4} className='border p-2 text-right'>
            Total
          </td>
          <td className='border p-2 text-right'>
            {salesOrder?.items?.reduce((acc, item) => acc + item?.quantity, 0)}
          </td>
          <td className='border p-2'></td>
        </tr>
      </tbody>
    </table>
  )
}
