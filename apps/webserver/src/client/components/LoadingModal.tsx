import { Backdrop, CircularProgress } from '@mui/material';

export function LoadingModal({ isLoading }: { isLoading: boolean }) {
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={isLoading}
    >
      <CircularProgress />
    </Backdrop>
  );
}
