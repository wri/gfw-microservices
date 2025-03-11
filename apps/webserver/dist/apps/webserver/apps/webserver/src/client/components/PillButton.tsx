import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const PillButton = styled(Button)({
  borderRadius: '100px',
  padding: '0.375rem 1.5rem',
  letterSpacing: '0.07125rem',
  display: 'flex',
  gap: '0.5rem',

  '& > span': {
    margin: 0,
  },
});
