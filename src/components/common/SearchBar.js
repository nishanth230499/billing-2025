import ClearIcon from '@mui/icons-material/Clear'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function SearchBar({ label, className }) {
  const { getURL, searchParams } = useHandleSearchParams()

  const selectedSearchText = useMemo(
    () => searchParams.get('searchText') || '',
    [searchParams]
  )

  const [searchText, setSearchText] = useState(selectedSearchText)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      window.history.pushState(
        {},
        '',
        getURL({ searchText: searchText || undefined })
      )
    }
  }

  return (
    <TextField
      slotProps={{
        input: {
          className: 'rounded-4xl px-4',
          endAdornment: (selectedSearchText || searchText) && (
            <InputAdornment position='end'>
              <IconButton
                onClick={() => {
                  window.history.pushState(
                    {},
                    '',
                    getURL({ searchText: undefined })
                  )
                  setSearchText('')
                }}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
        inputLabel: {
          sx: {
            marginLeft: 2,
          },
        },
      }}
      sx={{
        '& legend': {
          marginLeft: 2,
        },
      }}
      className={className}
      label={label}
      fullWidth
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}
