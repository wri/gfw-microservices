import { useState, FC, ChangeEvent } from 'react';
import {
  Select,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Grid,
  SelectChangeEvent,
} from '@mui/material';

import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import { PillButton } from '../../../../../../components';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle } from './filterStyles';
import '../../../../../../common/css/filter-dialogs.scss';

interface GFWProtectedForestChangeFilterProps {
  protectedAreas: Array<{ [key: string]: string }>;
  isFilterModalVisible: boolean;
}

const GFWProtectedForestChangeFilter: FC<GFWProtectedForestChangeFilterProps> = ({
  protectedAreas,
  isFilterModalVisible,
}) => {
  const initialState: DefaultFilterValues = store.getState().filters;
  const [state, setState] = useState<DefaultFilterValues>(initialState);

  const onCountryChange = (evt: ChangeEvent<{ value: unknown }>) => {
    setState({
      ...state,
      selectedCountry: evt.target.value as string,
      selectedState: '',
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
    });
  };

  const onStateChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
    });
  };

  const onSubStateChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedSubState: evt.target.value,
      selectedDesignationType: '',
      selectedDesignation: '',
    });
  };

  const onDesignationTypeChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedDesignationType: evt.target.value,
    });
  };

  const onDesignationChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedDesignation: evt.target.value,
    });
  };

  const updateValues = () => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      const value = state[key as keyof DefaultFilterValues];
      if (value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        filterCount++;
      }
    });
    const filters = {
      selectedCountry: state.selectedCountry,
      selectedState: state.selectedState,
      selectedSubState: state.selectedSubState,
      selectedDesignationType: state.selectedDesignationType,
      selectedDesignation: state.selectedDesignation,
    };
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(filters));
    store.dispatch(setFilterCount(filterCount));
  };

  const onCloseHandler = () => {
    setState(initialState);
    store.dispatch(toggleCanopyModal());
  };

  const countries = Array.from(
    new Set(protectedAreas.map((list) => list.Country).filter(Boolean))
  ).sort();
  const states = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) => location.Country === state.selectedCountry && location?.State?.trim().length
        )
        .map((list) => list.State)
    )
  ).sort();
  const subStates = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry &&
            location.State === state.selectedState &&
            location?.['Sub State']?.trim().length
        )
        .map((list) => list['Sub State'])
    )
  ).sort();

  const designationTypeOptions = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry &&
            location.State === state.selectedState &&
            location?.['Designation Type']?.trim().length
        )
        .map((list) => list['Designation Type'])
    )
  )
    .sort()
    ?.slice(0, 400);

  const designationOptions = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry &&
            location.State === state.selectedState &&
            location?.Designation?.trim().length
        )
        .map((list) => list.Designation)
    )
  )
    .sort()
    ?.slice(0, 400);

  const isCountrySetInFilter = !!store.getState().filters?.selectedCountry;
  const isCountrySetInState = !!state?.selectedCountry;
  return (
    <Modal
      open={isFilterModalVisible}
      onClose={isCountrySetInFilter || countries.length === 0 ? onCloseHandler : undefined}
    >
      <Box sx={boxStyle}>
        {!isCountrySetInFilter && (
          <p style={{ margin: '0 0 8px', color: '#555', fontSize: '0.875rem' }}>
            {countries.length === 0
              ? 'No filter options are available at the moment. Please try again later.'
              : 'At least one filter must be enabled in order to continue.'}
          </p>
        )}
        <h3>Show Protected Areas for</h3>
        <Grid container spacing={3}>
          <CountryStateSubStateFilter
            countries={countries}
            selectedCountry={state.selectedCountry}
            onCountryChange={onCountryChange}
            states={states}
            selectedState={state.selectedState}
            onStateChange={onStateChange}
            subStates={subStates}
            selectedSubState={state.selectedSubState}
            onSubStateChange={onSubStateChange}
            isCountryFieldRequired
          />
          <Grid item xs={6}>
            <FormControl sx={selectStyle} disabled={!designationTypeOptions.length}>
              <InputLabel id="designation-type">Designation Type</InputLabel>
              <Select
                id="designation-type"
                value={state.selectedDesignationType}
                onChange={onDesignationTypeChange}
                label="Designation Type"
              >
                {designationTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl sx={selectStyle} disabled={!designationOptions.length}>
              <InputLabel id="designation">Designation</InputLabel>
              <Select
                id="designation"
                value={state.selectedDesignation}
                onChange={onDesignationChange}
                label="Designation"
              >
                {designationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ justifyContent: 'flex-end', display: 'flex', gap: 1 }}>
            {isCountrySetInFilter && (
              <PillButton variant="contained" onClick={onCloseHandler}>
                Cancel
              </PillButton>
            )}
            <PillButton variant="contained" onClick={updateValues} disabled={!isCountrySetInState}>
              Apply
            </PillButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default GFWProtectedForestChangeFilter;
