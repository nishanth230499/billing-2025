import { TextField } from '@mui/material'
import { useMemo } from 'react'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import { formatForDateTimeInput } from '@/lib/utils/dateUtils'

export default function DateSelector({ label, searchKeyParam }) {
  const { getURL, searchParams } = useHandleSearchParams()

  const dateTime = useMemo(() => {
    const timeString = searchParams.get(searchKeyParam) || ''
    if (timeString) return new Date(Number(timeString))
    return timeString
  }, [searchKeyParam, searchParams])

  return (
    <TextField
      type='datetime-local'
      fullWidth
      label={label}
      value={formatForDateTimeInput(dateTime)}
      onChange={(e) => {
        window.history.replaceState(
          {},
          '',
          getURL({
            [searchKeyParam]: e.target.value
              ? Number(new Date(e.target.value))
              : null,
          })
        )
      }}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  )
}
