import { InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const FieldLabel = styled(InputLabel)({
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontWeight: 400,
  lineHeight: '1.2',
  fontSize: '14px',
  marginBottom: '5px',
});

export default FieldLabel;
