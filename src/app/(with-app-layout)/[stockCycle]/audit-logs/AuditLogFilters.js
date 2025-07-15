import ClearIcon from '@mui/icons-material/Clear'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'

import CollectionSelector from '@/components/common/selectors/CollectionSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import UserSelector from '@/components/common/selectors/UserSelector'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'

export default function AuditLogFilters() {
  const { getURL, searchParams } = useHandleSearchParams()

  const collectionName = useMemo(
    () => searchParams.get('collectionName') ?? '',
    [searchParams]
  )
  const documentId = useMemo(
    () => searchParams.get('documentId') ?? '',
    [searchParams]
  )
  const updatedById = useMemo(
    () => searchParams.get('updatedById') ?? '',
    [searchParams]
  )
  const startDateTime = useMemo(
    () => Number(searchParams.get('startDateTime')),
    [searchParams]
  )
  const endDateTime = useMemo(
    () => Number(searchParams.get('endDateTime')),
    [searchParams]
  )

  const appliedFiltersCount = useMemo(
    () =>
      [collectionName, updatedById, startDateTime, endDateTime].filter(Boolean)
        .length,
    [collectionName, endDateTime, startDateTime, updatedById]
  )

  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [selectedCollectionName, setSelectedCollectionName] =
    useState(collectionName)
  const [selectedDocumentId, setSelectedDocumentId] = useState(documentId)
  const [selectedUserId, setSelectedUserId] = useState(updatedById)
  const [selectedStartDateTime, setSelectedStartDateTime] =
    useState(startDateTime)
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(endDateTime)

  const handleApplyFilters = useCallback(() => {
    window.history.replaceState(
      {},
      '',
      getURL({
        collectionName: selectedCollectionName || null,
        documentId: selectedDocumentId || null,
        updatedById: selectedUserId || null,
        startDateTime: selectedStartDateTime || null,
        endDateTime: selectedEndDateTime || null,
      })
    )
  }, [
    getURL,
    selectedCollectionName,
    selectedDocumentId,
    selectedEndDateTime,
    selectedStartDateTime,
    selectedUserId,
  ])

  const handleClearFilters = useCallback(() => {
    setSelectedCollectionName('')
    setSelectedDocumentId('')
    setSelectedUserId('')
    setSelectedStartDateTime(0)
    setSelectedEndDateTime(0)
    window.history.replaceState(
      {},
      '',
      getURL({
        collectionName: null,
        documentId: null,
        updatedById: null,
        startDateTime: null,
        endDateTime: null,
      })
    )
  }, [getURL])

  return (
    <>
      <Paper className='px-4 py-2 mb-4'>
        <Box className='flex items-center justify-between'>
          <Typography variant='h6'>{`Filters${
            appliedFiltersCount ? ` (${appliedFiltersCount} applied)` : ''
          }`}</Typography>
          <IconButton onClick={() => setFiltersExpanded(!filtersExpanded)}>
            {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={filtersExpanded} timeout='auto' unmountOnExit>
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, sm: 2, md: 3 }}
            className='mt-2'>
            <Grid size={1}>
              <CollectionSelector
                selectedCollectionName={selectedCollectionName}
                setSelectedCollectionName={setSelectedCollectionName}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                label='Search for Document ID'
                fullWidth
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: selectedDocumentId && (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setSelectedDocumentId('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={1}></Grid>
            <Grid size={1}>
              <UserSelector
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
              />
            </Grid>
            <Grid size={1}>
              <DateSelector
                label='Select Start Date & Time'
                searchKeyParam='startDateTime'
                selectedDateTime={selectedStartDateTime}
                setSelectedDateTime={setSelectedStartDateTime}
              />
            </Grid>
            <Grid size={1}>
              <DateSelector
                label='Select End Date & Time'
                searchKeyParam='endDateTime'
                selectedDateTime={selectedEndDateTime}
                setSelectedDateTime={setSelectedEndDateTime}
              />
            </Grid>
          </Grid>
          <Grid container justifyContent='end' spacing={2} className='mt-2'>
            <Grid>
              <Button variant='text' onClick={handleClearFilters}>
                Clear
              </Button>
            </Grid>
            <Grid>
              <Button
                className='rounded-3xl'
                variant='contained'
                onClick={handleApplyFilters}>
                Apply
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </>
  )
}
