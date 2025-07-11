import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const PillButton = styled(Button)(({ theme }) => ({
  borderRadius: '100px',
  padding: '0.375rem 1.5rem',
  letterSpacing: '0.07125rem',
  display: 'flex',
  gap: '0.5rem',

  '&.MuiButton-textInfo': {
    color: theme.palette.info.contrastText,
  },

  '& > span': {
    margin: 0,
  },
}));
