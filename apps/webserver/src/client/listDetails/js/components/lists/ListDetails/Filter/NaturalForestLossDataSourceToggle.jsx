import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { toggleNaturalForestLossDataSource } from '../../../../../../locations/js/actions/locationActions';
import store from '../../../../../../locations/js/store';
import {
  SBTN_NATURAL_FOREST_LOSS,
  JRC_NATURAL_FOREST_LOSS,
} from '../deforestationDisplayFormat.constants';
import { selectStyle } from './filterStyles';

const NaturalForestLossDataSourceToggle = () => {
  return (
    <FormControl variant="outlined" sx={{ ...selectStyle, width: 'auto' }}>
      <InputLabel sx={{ background: 'white', padding: '0px 10px' }}>Forest Dataset</InputLabel>
      <Select
        value={store.getState().naturalForestLossDataSource}
        sx={{ fontSize: '0.875rem' }}
        onChange={({ target }) => {
          console.log(target.value);
          store.dispatch(toggleNaturalForestLossDataSource(target.value));
        }}
      >
        <MenuItem key={JRC_NATURAL_FOREST_LOSS} value={JRC_NATURAL_FOREST_LOSS}>
          JRC Natural Forest Loss
        </MenuItem>
        <MenuItem key={SBTN_NATURAL_FOREST_LOSS} value={SBTN_NATURAL_FOREST_LOSS}>
          SBTN Natural Forest Loss
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default NaturalForestLossDataSourceToggle;
