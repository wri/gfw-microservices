import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const PillButton = styled(Button)(({ theme }) => ({
  height: 'fit-content',
  borderRadius: 20,
  px: 0.75,
  py: 3,
  letterSpacing: '0.07125rem',
  display: 'flex',
  gap: 1,

  '&.MuiButton-textInfo': {
    color: theme.palette.info.contrastText,
  },

  '&.MuiButton-containedSecondary': {
    color: theme.palette.secondary.contrastText,
  },

  '& > span': {
    margin: 0,
  },
}));
