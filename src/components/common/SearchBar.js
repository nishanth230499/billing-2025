import ClearIcon from '@mui/icons-material/Clear'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function SearchBar({
  label,
  className,
  validator = () => true,
  searchParamName = 'searchText',
}) {
  const { getURL, searchParams } = useHandleSearchParams()

  const selectedSearchText = useMemo(
    () => searchParams.get(searchParamName) || '',
    [searchParamName, searchParams]
  )

  const [searchText, setSearchText] = useState(selectedSearchText)
  const error = useMemo(() => !validator(searchText), [searchText, validator])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && validator(searchText)) {
      window.history.replaceState(
        {},
        '',
        getURL({ [searchParamName]: searchText || undefined })
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
                  window.history.replaceState(
                    {},
                    '',
                    getURL({ [searchParamName]: undefined })
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
      margin='normal'
      className={className}
      label={label}
      fullWidth
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={handleKeyDown}
      error={error}
    />
  )
}
