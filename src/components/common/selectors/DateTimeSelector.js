import ClearIcon from '@mui/icons-material/Clear'
import { IconButton, InputAdornment, TextField } from '@mui/material'

import { formatForDateTimeInput } from '@/lib/utils/dateUtils'

export default function DateTimeSelector({
  label,
  selectedDateTime,
  setSelectedDateTime,
}) {
  return (
    <TextField
      margin='normal'
      type='datetime-local'
      fullWidth
      label={label}
      value={formatForDateTimeInput(selectedDateTime)}
      onChange={(e) => {
        setSelectedDateTime(
          e.target.value ? Number(new Date(e.target.value)) : null
        )
      }}
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          endAdornment: selectedDateTime ? (
            <InputAdornment position='end'>
              <IconButton onClick={() => setSelectedDateTime(null)}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  )
}
