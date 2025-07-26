import { Autocomplete, Box, TextField } from '@mui/material'
import { useEffect } from 'react'

export default function AutoComplete({
  inputValue = '',
  setInputValue,
  selectedKey = '',
  selectedLabel = '',
  setSelectedKey,
  options = [],
  autoFilterOptions = false,
  error = false,
  loading = false,
  required = false,
  placeholder = 'Search',
  noOptionsText = 'Not Found',
}: {
  inputValue: string
  // eslint-disable-next-line no-unused-vars
  setInputValue: (key: string) => void
  selectedKey: string
  selectedLabel: string
  // eslint-disable-next-line no-unused-vars
  setSelectedKey: (key: string) => void
  options: { key: string; label: string; highlightColor?: string }[]
  autoFilterOptions?: boolean
  error?: boolean
  loading?: boolean
  required?: boolean
  placeholder?: string
  noOptionsText?: string
}) {
  useEffect(() => {
    setInputValue(selectedLabel)
  }, [selectedLabel, setInputValue])

  return (
    <Autocomplete
      loading={loading}
      inputValue={inputValue ?? ''}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') setInputValue(val)
        if (reason === 'blur') setInputValue(selectedLabel)
      }}
      value={{ key: selectedKey, label: selectedLabel }}
      onChange={(_, option) => {
        setSelectedKey(option?.key ?? '')
        setInputValue(option?.label ?? '')
      }}
      options={options}
      getOptionKey={(option) => option?.key}
      renderInput={({ ...params }) => (
        <TextField
          {...params}
          required={required}
          label={placeholder}
          margin='normal'
          error={error}
        />
      )}
      renderOption={(props, option) => (
        <Box
          {...props}
          component='li'
          key={option.key}
          sx={{
            borderLeft: option.highlightColor
              ? `4px solid ${option.highlightColor}`
              : undefined,
          }}>
          {option.label}
        </Box>
      )}
      isOptionEqualToValue={(option, selectedOption) =>
        option?.key === selectedOption?.key
      }
      noOptionsText={noOptionsText}
      filterOptions={autoFilterOptions ? undefined : (options) => options}
    />
  )
}
