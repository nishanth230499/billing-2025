'use server'

export async function getIncrementedNumber(
  { model, filters, fieldName = 'number' },
  session
) {
  return (
    ((
      await model
        .aggregate([
          { $match: filters },
          {
            $group: {
              _id: null,
              maxNumber: { $max: `$${fieldName}` },
            },
          },
        ])
        .session(session)
    )?.[0]?.maxNumber ?? 0) + 1
  )
}
