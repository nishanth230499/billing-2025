import {
  Button,
  DialogActions,
  DialogContent,
  Divider,
  Input,
  MenuItem,
  TextField,
} from '@mui/material'
import { Box, Grid } from '@mui/system'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { v4 as uuid } from 'uuid'

import { parseSalesOrderAction } from '@/actions/salesOrderActions'
import Modal from '@/components/common/Modal'
import useHandleSearchParams from '@/hooks/useHandleSearchParams'
import handleServerAction from '@/lib/handleServerAction'

export default function DocumentParseModal({
  open,
  onClose,
  setSelectedItems,
  setSelectedItemsOrder,
  setOrderRef,
}) {
  const params = useParams()

  const { replaceURL } = useHandleSearchParams()
  const stockCycleId = params.stockCycle

  const [documents, setDocuments] = useState({})
  const inputsRef = useRef({})

  useEffect(() => {
    if (open) setDocuments({})
  }, [open])

  const { mutate: parseSalesOrder, isPending: isParseSalesOrderLoading } =
    useMutation({
      mutationFn: (data) => handleServerAction(parseSalesOrderAction, ...data),
    })

  const handleSubmit = useCallback(() => {
    if (Object.keys(documents).length === 0) {
      enqueueSnackbar('Please add documents to parse!', { variant: 'error' })
      return
    }
    if (!Object.values(documents).every(({ file, text }) => file || text)) {
      enqueueSnackbar('Missing text or file!', { variant: 'error' })
      return
    }
    const formData = new FormData()
    Object.values(documents).forEach(({ type, text, file }) => {
      formData.append('document', type === 'text' ? text : file)
    })
    parseSalesOrder([stockCycleId, formData], {
      onSuccess: ({ message, parsedSalesOrder }) => {
        const items = {}
        parsedSalesOrder?.items.forEach((item) => {
          items[uuid()] = item
        })
        replaceURL({ customerId: parsedSalesOrder?.customerId || undefined })
        setOrderRef(parsedSalesOrder?.orderRef)
        setSelectedItems(items)
        setSelectedItemsOrder(Object.keys(items))
        enqueueSnackbar(message, { variant: 'success' })
        onClose()
      },
      onError: (error) => enqueueSnackbar(error.message, { variant: 'error' }),
    })
  }, [
    documents,
    onClose,
    parseSalesOrder,
    replaceURL,
    setOrderRef,
    setSelectedItems,
    setSelectedItemsOrder,
    stockCycleId,
  ])

  return (
    <Modal title='Parse Sales Order Documents' open={open} onClose={onClose}>
      <DialogContent className='flex flex-col'>
        <Button
          className='rounded-3xl'
          variant='outlined'
          onClick={() =>
            setDocuments((documents) => ({
              ...documents,
              [uuid()]: { type: '' },
            }))
          }>
          Add Document
        </Button>
        {Object.entries(documents)?.map(([key, document], i) => (
          <Fragment key={key}>
            <Grid
              container
              columnSpacing={2}
              columns={{ xs: 1, sm: 2 }}
              alignItems='center'
              className='mb-2'>
              <Grid size={1}>
                <TextField
                  select
                  fullWidth
                  margin='normal'
                  label='Document Type'
                  value={document.type}
                  onChange={(e) =>
                    setDocuments((documents) => ({
                      ...documents,
                      [key]: { type: e.target.value },
                    }))
                  }>
                  <MenuItem value='pdf'>PDF</MenuItem>
                  <MenuItem value='image'>Image</MenuItem>
                  <MenuItem value='text'>Text</MenuItem>
                </TextField>
              </Grid>
              <Grid size={1}>
                {(document?.type === 'pdf' || document?.type === 'image') && (
                  <Box className='flex items-center'>
                    <Input
                      type='file'
                      className='hidden'
                      inputProps={{
                        accept:
                          document.type === 'pdf'
                            ? 'application/pdf'
                            : 'image/png, image/jpeg',
                      }}
                      inputRef={(ele) => {
                        inputsRef.current[i] = ele
                      }}
                      onChange={(e) =>
                        setDocuments((documents) => ({
                          ...documents,
                          [key]: {
                            ...documents?.[key],
                            file: e.target.files[0],
                          },
                        }))
                      }
                    />
                    <Button
                      className='rounded-3xl mr-2 shrink-0'
                      variant='outlined'
                      onClick={() => inputsRef.current[i].click()}>
                      Select {document?.type === 'pdf' ? 'PDF' : 'Image'}
                    </Button>
                    {document?.file?.name}
                  </Box>
                )}
                {document?.type === 'text' && (
                  <TextField
                    fullWidth
                    margin='normal'
                    multiline
                    maxRows={5}
                    label='Text'
                    value={document.text}
                    onChange={(e) =>
                      setDocuments((documents) => ({
                        ...documents,
                        [key]: {
                          ...documents?.[key],
                          text: e.target.value,
                        },
                      }))
                    }
                  />
                )}
              </Grid>
            </Grid>
            <Divider className='sm:hidden' />
          </Fragment>
        ))}
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button className='rounded-3xl' onClick={onClose}>
          Cancel
        </Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          loading={isParseSalesOrderLoading}
          onClick={handleSubmit}>
          Parse
        </Button>
      </DialogActions>
    </Modal>
  )
}
