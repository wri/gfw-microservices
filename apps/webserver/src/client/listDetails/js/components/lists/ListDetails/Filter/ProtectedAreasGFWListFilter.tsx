import React, { useState } from 'react';
import {
  Select,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Grid,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle } from './filterStyles';
import '../../../../../../common/css/filter-dialogs.scss';

interface GFWProtectedForestChangeFilterProps {
  protectedAreas: Array<{ [key: string]: string }>;
  isFilterModalVisible: boolean;
}

const GFWProtectedForestChangeFilter: React.FC<GFWProtectedForestChangeFilterProps> = ({
  protectedAreas,
  isFilterModalVisible,
}) => {
  const initialState: DefaultFilterValues = store.getState().filters;
  const [state, setState] = useState<DefaultFilterValues>(initialState);

  const onCountryChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState({
      ...state,
      selectedCountry: evt.target.value as string,
      selectedState: '',
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  const onStateChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  const onSubStateChange = (evt: SelectChangeEvent<string>) => {
    setState({
      ...state,
      selectedSubState: evt.target.value,
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
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

  const onProtectedAreasChange = (event: any, newValue: any[]) => {
    setState((prevState) => ({
      ...prevState,
      selectedNames: newValue.map((s) => s.value),
    }));
  };

  const updateValues = () => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      if (state[key as keyof DefaultFilterValues]) filterCount++;
    });

    const filters = {
      selectedCountry: state.selectedCountry,
      selectedState: state.selectedState,
      selectedSubState: state.selectedSubState,
      selectedDesignationType: state.selectedDesignationType,
      selectedDesignation: state.selectedDesignation,
      selectedNames: state.selectedNames.map((v) => v.label),
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

  const protectedAreasOptions = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry &&
            location.State === state.selectedState &&
            location?.['Location Name']?.trim().length
        )
        .map((list) => list['Location Name'])
    )
  )
    .sort()
    .map((v) => ({ label: v, value: v }));

  const isCountrySetInFilter = !!store.getState().filters?.selectedCountry;
  const isCountrySetInState = !!state?.selectedCountry;
  return (
    <Modal open={isFilterModalVisible} onClose={onCloseHandler}>
      <Box sx={boxStyle}>
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
          <Grid item xs={12}>
            <FormControl sx={selectStyle} disabled={!protectedAreasOptions.length}>
              <Autocomplete
                multiple
                options={protectedAreasOptions || []}
                getOptionLabel={(option) => option.label}
                value={state.selectedNames?.map((v) => ({ value: v, label: v })) || []}
                filterSelectedOptions
                disabled={!protectedAreasOptions.length}
                onChange={onProtectedAreasChange}
                renderInput={(params) => <TextField {...params} label="Protected Areas" />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ justifyContent: 'flex-end', display: 'flex' }}>
            {isCountrySetInFilter && (
              <Button variant="secondary" onClick={onCloseHandler} label="Cancel" />
            )}
            <Button
              variant="primary"
              onClick={updateValues}
              disabled={!isCountrySetInState}
              label="Apply"
              style={{ marginLeft: '10px' }}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default GFWProtectedForestChangeFilter;
