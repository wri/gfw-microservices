import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const HectareKilometerStyledSwitch = styled(Switch)(() => ({
  width: 68,
  height: 59,
  padding: '10px 0px',
  margin: '0px 4px',

  '& .MuiSwitch-switchBase': {
    margin: 2,
    padding: 0,
    top: 11,
    left: 5,

    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        content: '"KM"',
      },
      '& + .MuiSwitch-track': {
        backgroundColor: 'white',
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#97bd3d',
    width: 32,
    height: 32,
    '&::before': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 6,
      top: '28%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      content: '"HA"',
      fontSize: 12,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    border: '1px solid lightgray',
  },
}));

export default function HectareKilometerSwitch({ areaUnit, setAreaUnit }) {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <HectareKilometerStyledSwitch
            sx={{ m: 1 }}
            checked={areaUnit === 'km'}
            data-testid="hectare-kilometer-switch"
            onChange={() => {
              setAreaUnit(areaUnit === 'km' ? 'ha' : 'km');
            }}
          />
        }
      />
    </FormGroup>
  );
}
