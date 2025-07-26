import ClearIcon from '@mui/icons-material/Clear'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'

import CollectionSelector from '@/components/common/selectors/CollectionSelector'
import DateSelector from '@/components/common/selectors/DateSelector'
import UserSelector from '@/components/common/selectors/UserSelector'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import { AuditLogType } from '@/models/AuditLog'
import { modelConstants } from '@/models/constants'

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
  const updateType = useMemo(
    () => searchParams.get('updateType') ?? '',
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
      [
        collectionName,
        documentId,
        updateType,
        updatedById,
        startDateTime,
        endDateTime,
      ].filter(Boolean).length,
    [
      collectionName,
      documentId,
      endDateTime,
      startDateTime,
      updateType,
      updatedById,
    ]
  )

  const [selectedCollectionName, setSelectedCollectionName] =
    useState(collectionName)
  const [selectedDocumentId, setSelectedDocumentId] = useState(documentId)
  const [selectedUpdateType, setSelectedUpdateType] = useState(updateType)
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
        updateType: selectedUpdateType || null,
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
    selectedUpdateType,
    selectedUserId,
  ])

  const handleClearFilters = useCallback(() => {
    setSelectedCollectionName('')
    setSelectedDocumentId('')
    setSelectedUpdateType('')
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
    <Box className='mb-4'>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='audit-log-filters-content'
          id='audit-log-filters-header'>
          <Typography variant='h6' component='span'>{`Filters${
            appliedFiltersCount ? ` (${appliedFiltersCount} applied)` : ''
          }`}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container columnSpacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
            <Grid size={1}>
              <CollectionSelector
                ignoreCollections={[modelConstants.audit_log.collectionName]}
                selectedCollectionName={selectedCollectionName}
                setSelectedCollectionName={setSelectedCollectionName}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                margin='normal'
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
            <Grid size={1}>
              <TextField
                select
                margin='normal'
                fullWidth
                label='Type'
                value={selectedUpdateType}
                onChange={(e) => setSelectedUpdateType(e.target.value)}>
                <MenuItem value=''>All</MenuItem>
                {Object.values(AuditLogType)?.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
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
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
