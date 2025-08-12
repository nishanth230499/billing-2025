import { Backdrop, CircularProgress } from '@mui/material'

export default function Loader({ loading }: { loading: boolean }) {
  return (
    <Backdrop open={loading} slotProps={{ root: { sx: { zIndex: 'loader' } } }}>
      <CircularProgress color='inherit' />
    </Backdrop>
  )
}
