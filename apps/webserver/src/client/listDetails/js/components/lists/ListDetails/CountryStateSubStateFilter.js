import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { locationsPage } from '../../../../../common/js/config';
import { selectStyle } from './Filter/filterStyles';

const CountryStateSubStateFilter = ({
  countries,
  selectedCountry = '',
  onCountryChange,
  states,
  selectedState = '',
  onStateChange,
  subStates,
  selectedSubState = '',
  onSubStateChange,
}) => {
  return (
    <div style={{ display: 'flex' }}>
      <FormControl sx={selectStyle}>
        <InputLabel id="country-select-label">{locationsPage.lists.selectCountry}</InputLabel>
        <Select
          labelId="country-select-label"
          id="country_select"
          value={selectedCountry}
          onChange={onCountryChange}
          label={locationsPage.lists.selectCountry}
        >
          {countries.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={selectStyle}>
        <InputLabel id="state-select-label">{locationsPage.lists.selectState}</InputLabel>
        <Select
          labelId="state-select-label"
          id="state_select"
          value={selectedState}
          onChange={onStateChange}
          label={locationsPage.lists.selectState}
          disabled={!selectedCountry || states.length === 0}
        >
          {states.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={selectStyle}>
        <InputLabel id="substate-select-label">{locationsPage.lists.selectSubState}</InputLabel>
        <Select
          labelId="substate-select-label"
          id="substate_select"
          value={selectedSubState}
          onChange={onSubStateChange}
          label={locationsPage.lists.selectSubState}
          disabled={!selectedState || subStates.length === 0}
        >
          {subStates.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CountryStateSubStateFilter;
