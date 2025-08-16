const ParsedSalesOrderSchema = {
  type: 'object',
  properties: {
    // text: { type: 'string', description: 'The text on the file.' },
    customerEmail: {
      type: 'string',
      description:
        'The email id of the sender in the text on the file. If it is not found use empty string.',
    },
    customerName: {
      type: 'string',
      description:
        'The firm name of the sender in the text on the file. If it is not found use empty string.',
    },
    customerPlace: {
      type: 'string',
      description:
        'The city where the firm of the sender is located. If it is not found use empty string.',
    },
    orderRef: {
      type: 'string',
      description:
        'The order number of the order in the text on the file. If it is not found use empty string.',
    },
    customerShippingAddress: {
      type: 'string',
      description:
        'The shipping address. If the customer has mentioned to ship to a different address, consider that as the shipping address. Do not consider any other address as the shipping address. If it is not found use empty string. Incluce phone number of the shipping address if mentioned.',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              'The category of the order item. It is usually mentioned above a set of order items or it is mentioned in Publisher or Company column. If it is not found use empty string.',
          },
          name: { type: 'string', description: 'The name of the order item' },
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                variant_name: {
                  type: 'string',
                  description:
                    'The name of the variant. It is usually denoted as a letter or a number. The serial number is not the variant name. If the variant name is not found, use empty string.',
                },
                qty: {
                  type: 'integer',
                  description:
                    'The quantity of the variant. Usually different variants are separated by ",". Usually the variant name and corresponding quantity are separated by "/".',
                },
              },

              required: ['variant_name', 'qty'],
            },
          },
        },
        required: ['category', 'name', 'variants'],
      },
    },
  },
  required: [
    'text',
    'sender_email',
    'sender_firm_name',
    'order_no',
    'ship_to_address',
    'order_items',
  ],
}

export default ParsedSalesOrderSchema
