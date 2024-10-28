import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const borderWidth = '2px';
export const LocationTypeButton = styled(Button)({
  gap: '0.5rem',
  justifyContent: 'start',

  padding: '1rem 1.25rem',
  borderWidth,

  '&:hover': {
    borderWidth,
  },

  'svg, p': {
    color: 'black',
    fontWeight: 'normal',
    textTransform: 'none',
  },
});
