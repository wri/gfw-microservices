import { Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { locationsPage } from '../../../../../../common/js/config';
import { selectStyle } from './filterStyles';

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
  isCountryFieldRequired = false,
}) => {
  return (
    <>
      <Grid item xs={4}>
        <FormControl sx={selectStyle}>
          <InputLabel id="country-select-label">
            {locationsPage.lists.selectCountry}
            {isCountryFieldRequired && (
              <span style={{ color: 'red', fontSize: '1.5rem' }}>*</span>
            )}{' '}
          </InputLabel>
          <Select
            data-cy="country-filter-dropdown"
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
      </Grid>
      <Grid item xs={4}>
        <FormControl sx={selectStyle} disabled={!selectedCountry || states.length === 0}>
          <InputLabel id="state-select-label">{locationsPage.lists.selectState}</InputLabel>
          <Select
            data-cy="state-filter-dropdown"
            labelId="state-select-label"
            id="state_select"
            value={selectedState}
            onChange={onStateChange}
            label={locationsPage.lists.selectState}
          >
            {states.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl sx={selectStyle} disabled={!selectedState || subStates.length === 0}>
          <InputLabel id="substate-select-label">{locationsPage.lists.selectSubState}</InputLabel>
          <Select
            data-cy="substate-filter-dropdown"
            labelId="substate-select-label"
            id="substate_select"
            value={selectedSubState}
            onChange={onSubStateChange}
            label={locationsPage.lists.selectSubState}
          >
            {subStates.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
};

export default CountryStateSubStateFilter;
