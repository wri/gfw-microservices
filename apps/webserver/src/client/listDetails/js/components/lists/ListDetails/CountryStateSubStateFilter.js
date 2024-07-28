import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { locationsPage } from '../../../../../common/js/config';

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
  const gfwGreen = '#97bd3d';
  const selectStyle = {
    minWidth: 200,
    marginRight: '1rem',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: gfwGreen,
      },
      '&:hover fieldset': {
        borderColor: gfwGreen,
      },
      '&.Mui-focused fieldset': {
        borderColor: gfwGreen,
      },
    },
    '& .MuiInputLabel-root': {
      color: gfwGreen,
      '&.Mui-focused': {
        color: gfwGreen,
      },
    },
  };

  return (
    <div className="country-state-substate-filter" style={{ display: 'flex', gap: '1rem' }}>
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
