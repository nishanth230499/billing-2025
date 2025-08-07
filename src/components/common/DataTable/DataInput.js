import { Input } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

export default function DataInput({
  column,
  columnKey,
  data,
  setInputRef,
  onKeyDown,
  onChange,
}) {
  const [value, setValue] = useState('')
  const defaultValue = useMemo(
    () => (column?.format ? column?.format(data) : data?.[columnKey]) ?? '',
    [column, columnKey, data]
  )
  // if (value === '31') {
  //   console.log('Value', value)
  //   console.log('Data', data)
  //   console.log('data.columnKey', data?.[columnKey])
  //   console.log(defaultValue)
  // }
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const error = column?.validator && !column?.validator(data)
  return (
    <Input
      inputRef={(ele) => setInputRef(ele, columnKey)}
      onKeyDown={(e) => onKeyDown(e, columnKey)}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        // console.log(value, defaultValue, value === defaultValue)
        if (value !== defaultValue) onChange(value, columnKey)
      }}
      error={error}
      inputProps={{ enterKeyHint: 'Done' }}
      enterKeyHint='done'
      sx={{
        borderBottomWidth: error ? 2 : undefined,
        borderBottomColor: (theme) => theme.palette.error.main,
      }}
    />
  )
}
