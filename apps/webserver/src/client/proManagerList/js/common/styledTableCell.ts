import { styled, TableCell, tableCellClasses } from '@mui/material';

export const StyledTableCell = styled(TableCell)(() => ({
  fontFamily: 'Fira Sans, sans-serif',
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    color: '#4e4e4ede',
  },
}));
