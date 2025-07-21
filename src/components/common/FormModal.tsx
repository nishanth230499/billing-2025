import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material'
import { GridSize, ResponsiveStyleValue } from '@mui/system'
import {
  FormEventHandler,
  HTMLInputTypeAttribute,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import Modal from '@/components/common/Modal'

import ErrorAlert from './ErrorAlert'

interface FormFieldBase {
  size: ResponsiveStyleValue<GridSize>
}

interface TextFormField extends FormFieldBase {
  type: 'text'
  text: ReactNode
}

interface InputFormField extends FormFieldBase {
  type: 'input'
  label: string
  inputName?: string
  inputType?: HTMLInputTypeAttribute
  required?: boolean
  autoFocus?: boolean
  multiline?: boolean
  // eslint-disable-next-line no-unused-vars
  validator?: (value: any, values: Object) => boolean
  helperText?: string
}

interface SelectFormField extends FormFieldBase {
  type: 'select'
  label: string
  required?: boolean
  autoFocus?: boolean
  // eslint-disable-next-line no-unused-vars
  validator?: (value: any, values: Object) => boolean
  options: { value: string; label: string }[]
  helperText?: string
}

interface SwitchFormField extends FormFieldBase {
  type: 'switch'
  label: string
}

interface CustomFormField extends FormFieldBase {
  type: 'custom'
  // eslint-disable-next-line no-unused-vars
  component: (props: {
    value: any
    // eslint-disable-next-line no-unused-vars
    onChange: (value: any) => void
    error: boolean
  }) => ReactNode
  // eslint-disable-next-line no-unused-vars
  validator?: (value: any, values: Object) => boolean
}

interface DividerFormField extends FormFieldBase {
  type: 'divider'
}

type FormFieldType =
  | TextFormField
  | InputFormField
  | SelectFormField
  | SwitchFormField
  | DividerFormField
  | CustomFormField

export default function FormModal({
  open,
  title,
  formId,
  submitButtonLabel = 'Save',
  formFields,
  initialFormFieldValues = {},
  // formFieldValues,
  // onFormFieldValuesChange,
  // formFieldErrors,
  // onFormFieldErrorsChange,
  isError,
  error,
  isFormLoading,
  isSubmitLoading,
  isSubmitButtonDisabled,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  formId: string
  submitButtonLabel: string
  formFields: { [formFieldName: string]: FormFieldType }
  initialFormFieldValues?: { [formFieldName: string]: any }
  // formFieldValues: { [formFieldName: string]: any }
  // onFormFieldValuesChange: Dispatch<SetStateAction<{}>>
  // formFieldErrors: { [formFieldName: string]: boolean }
  // onFormFieldErrorsChange: Dispatch<SetStateAction<{}>>
  isError?: boolean
  error?: Error
  isFormLoading?: boolean
  isSubmitLoading?: boolean
  isSubmitButtonDisabled?: boolean
  // eslint-disable-next-line no-unused-vars
  onSubmit: (values: any) => void
  onClose: () => void
}) {
  const [formFieldValues, setFormFieldValues] = useState<{
    [formFieldName: string]: any
  }>(initialFormFieldValues)

  const [formFieldErrors, setFormFieldErrors] = useState<{
    [formFieldName: string]: boolean
  }>({})

  const [formFieldsTouched, setFormFieldsTouched] = useState<{
    [formFieldName: string]: boolean
  }>({})

  useEffect(() => {
    if (open) {
      setFormFieldValues((values) => ({ ...values, ...initialFormFieldValues }))
    } else {
      setFormFieldValues({})
      setFormFieldErrors({})
      setFormFieldsTouched({})
    }
  }, [open, initialFormFieldValues])

  const setFormFieldValue = useCallback((value: any, formFieldName: string) => {
    setFormFieldValues((values) => ({
      ...values,
      [formFieldName]: value,
    }))
  }, [])

  const setFormFieldError = useCallback(
    (value: any, formFieldName: string, validator?: Function | undefined) => {
      if (typeof validator === 'function') {
        const validationPassed = validator(value, {
          ...formFieldValues,
          [formFieldName]: value,
        })
        if (typeof validationPassed === 'boolean') {
          setFormFieldErrors((errors) => ({
            ...errors,
            [formFieldName]: !validationPassed,
          }))
        }
        if (typeof validationPassed === 'object') {
          setFormFieldErrors((errors) => ({
            ...errors,
            ...Object.fromEntries(
              Object.entries(validationPassed).map(([name, passed]) => [
                name,
                !passed,
              ])
            ),
          }))
        }
      }
    },
    [formFieldValues]
  )

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault()
      const newErrors: { [formFieldName: string]: any } = {}
      Object.entries(formFields).forEach(([formFieldName, formField]) => {
        if (
          'validator' in formField &&
          typeof formField?.validator === 'function'
        ) {
          const validationPassed = formField?.validator(
            formFieldValues?.[formFieldName],
            formFieldValues
          )
          if (typeof validationPassed === 'boolean' && !validationPassed) {
            newErrors[formFieldName] = true
          }
          if (typeof validationPassed === 'object') {
            Object.entries(validationPassed).forEach(([name, passed]) => {
              newErrors[name] ||= !passed
            })
          }
        }
      })
      setFormFieldErrors((errors) => ({ ...errors, ...newErrors }))
      setFormFieldsTouched(
        Object.fromEntries(
          Object.entries(formFields).map(([formFieldName]) => [
            formFieldName,
            true,
          ])
        )
      )
      if (Object.values(newErrors).some((error) => error)) return
      onSubmit({ ...formFieldValues })
    },
    [formFieldValues, formFields, onSubmit]
  )
  return (
    <Modal
      open={open}
      title={title}
      isLoading={isFormLoading}
      onClose={onClose}>
      <DialogContent>
        <ErrorAlert isError={isError} error={error}>
          <Box component='form' id={formId} noValidate onSubmit={handleSubmit}>
            <Grid container columnSpacing={2}>
              {Object.entries(formFields).map(([formFieldName, formField]) => (
                <Grid
                  key={formFieldName}
                  size={formField?.size ?? { xs: 12, sm: 6 }}
                  alignSelf={
                    formField?.type === 'switch' || formField?.type === 'text'
                      ? 'center'
                      : 'flex-start'
                  }>
                  {formField.type === 'text' && formField?.text}
                  {formField.type === 'input' && (
                    <TextField
                      type={formField?.inputType ?? 'text'}
                      margin='normal'
                      fullWidth
                      multiline={formField?.multiline}
                      autoFocus={formField?.autoFocus}
                      required={formField?.required}
                      name={formField?.inputName ?? formFieldName}
                      label={formField?.label}
                      value={formFieldValues?.[formFieldName] ?? ''}
                      onChange={(e) => {
                        setFormFieldValue(e.target.value, formFieldName)
                        setFormFieldError(
                          e.target.value,
                          formFieldName,
                          formField?.validator
                        )
                        setFormFieldsTouched((fields) => ({
                          ...fields,
                          [formFieldName]: true,
                        }))
                      }}
                      error={
                        formFieldsTouched?.[formFieldName] &&
                        formFieldErrors?.[formFieldName]
                      }
                      helperText={formField?.helperText}
                    />
                  )}
                  {formField.type === 'select' && (
                    <TextField
                      select
                      margin='normal'
                      fullWidth
                      autoFocus={formField?.autoFocus}
                      required={formField?.required}
                      name={formFieldName}
                      label={formField?.label}
                      value={formFieldValues?.[formFieldName] ?? ''}
                      onChange={(e) => {
                        setFormFieldValue(e.target.value, formFieldName)
                        setFormFieldError(
                          e.target.value,
                          formFieldName,
                          formField?.validator
                        )
                        setFormFieldsTouched((fields) => ({
                          ...fields,
                          [formFieldName]: true,
                        }))
                      }}
                      error={
                        formFieldsTouched?.[formFieldName] &&
                        formFieldErrors?.[formFieldName]
                      }
                      helperText={formField?.helperText}>
                      {formField?.options?.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                  {formField?.type === 'switch' && (
                    <FormControlLabel
                      control={
                        <Switch
                          name={formFieldName}
                          checked={formFieldValues?.[formFieldName] ?? false}
                          onChange={(e) => {
                            setFormFieldValue(e.target.checked, formFieldName)
                            setFormFieldsTouched((fields) => ({
                              ...fields,
                              [formFieldName]: true,
                            }))
                          }}
                        />
                      }
                      name={formFieldName}
                      label={formField?.label}
                      labelPlacement='start'
                    />
                  )}
                  {formField?.type === 'divider' && (
                    <Divider className='my-4' />
                  )}
                  {formField?.type === 'custom' &&
                    formField?.component({
                      value: formFieldValues?.[formFieldName] ?? '',
                      onChange: (val) => {
                        setFormFieldValue(val, formFieldName)
                        setFormFieldError(
                          val,
                          formFieldName,
                          formField?.validator
                        )
                        setFormFieldsTouched((fields) => ({
                          ...fields,
                          [formFieldName]: true,
                        }))
                      },
                      error:
                        formFieldsTouched?.[formFieldName] &&
                        formFieldErrors?.[formFieldName],
                    })}
                </Grid>
              ))}
            </Grid>
          </Box>
        </ErrorAlert>
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button className='rounded-3xl' onClick={onClose}>
          Cancel
        </Button>
        <Button
          className='rounded-3xl'
          variant='contained'
          type='submit'
          form={formId}
          disabled={
            isError ||
            isFormLoading ||
            isSubmitLoading ||
            isSubmitButtonDisabled
          }
          loading={isSubmitLoading}>
          {submitButtonLabel}
        </Button>
      </DialogActions>
    </Modal>
  )
}
