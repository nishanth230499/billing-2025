import ClearIcon from '@mui/icons-material/Clear'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

export default function SearchBar({
  label,
  className,
  validator = () => true,
  searchText: selectedSearchText,
  setSearchText: setSelectedSearchText,
}) {
  const [searchText, setSearchText] = useState(selectedSearchText)
  const error = useMemo(() => !validator(searchText), [searchText, validator])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && validator(searchText)) {
      setSelectedSearchText(searchText || '')
    }
  }

  return (
    <TextField
      slotProps={{
        input: {
          slotProps: { input: { enterKeyHint: 'search' } },
          className: 'rounded-4xl px-4',
          endAdornment: (selectedSearchText || searchText) && (
            <InputAdornment position='end'>
              <IconButton
                onClick={() => {
                  setSelectedSearchText('')
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
